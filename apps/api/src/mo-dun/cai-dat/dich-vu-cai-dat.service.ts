import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  BanDoCaiDat,
  CaiDatHeThong,
  MaLoiNghiepVu,
  BAN_DO_DINH_NGHIA_CAI_DAT,
  DANH_MUC_CAI_DAT_HE_THONG,
  MAT_NA_KHOA_BI_MAT,
  KhoiPhucCaiDatInput,
  KiemTraKetNoiSmtpInput,
  TuyChonCaNhan,
  TUY_CHON_CA_NHAN_MAC_DINH,
  kiemTraMauChuDaoHopLe,
} from '@lms/chung';
import { randomUUID, createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import * as tls from 'tls';

const TIEN_TO_MA_HOA = 'enc:v1:';

const DUOI_TEP_THUC_THI_CAM = new Set([
  'exe',
  'dll',
  'bat',
  'cmd',
  'sh',
  'bash',
  'ps1',
  'vbs',
  'msi',
  'scr',
  'com',
  'pif',
  'php',
  'phtml',
  'jsp',
  'jspx',
  'asp',
  'aspx',
  'cgi',
  'pl',
  'py',
  'rb',
  'jar',
  'war',
  'js',
  'mjs',
  'cjs',
  'html',
  'htm',
  'xhtml',
  'svg',
]);

@Injectable()
export class DichVuCaiDatService {
  constructor(
    private readonly khoCaiDat: KhoCaiDatRepository,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  private layKhoaAes256(): Buffer {
    const chuoiGoc =
      process.env.SETTINGS_ENCRYPTION_KEY ||
      process.env.JWT_ACCESS_SECRET ||
      'khoa_ma_hoa_cai_dat_he_thong_lms_2026_aes256';
    return createHash('sha256').update(chuoiGoc).digest();
  }

  /**
   * Mã hóa AES-256-GCM cho các khóa cài đặt bí mật trước khi lưu CSDL
   */
  maHoaGiaTriBiMat(giaTriThuan: string): string {
    if (!giaTriThuan || !giaTriThuan.trim()) return '';
    if (giaTriThuan.startsWith(TIEN_TO_MA_HOA)) return giaTriThuan;

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.layKhoaAes256(), iv);
    const maHoa = Buffer.concat([cipher.update(giaTriThuan, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${TIEN_TO_MA_HOA}${iv.toString('hex')}:${authTag.toString('hex')}:${maHoa.toString('hex')}`;
  }

  /**
   * Giải mã AES-256-GCM để sử dụng nội bộ trên máy chủ
   */
  giaiMaGiaTriBiMat(giaTriLuuTru: string): string {
    if (!giaTriLuuTru) return '';
    if (!giaTriLuuTru.startsWith(TIEN_TO_MA_HOA)) {
      return giaTriLuuTru;
    }

    try {
      const phan = giaTriLuuTru.slice(TIEN_TO_MA_HOA.length).split(':');
      if (phan.length !== 3) return '';
      const [ivHex, tagHex, cipherHex] = phan;
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.layKhoaAes256(),
        Buffer.from(ivHex, 'hex'),
      );
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      const giaiMa = Buffer.concat([
        decipher.update(Buffer.from(cipherHex, 'hex')),
        decipher.final(),
      ]);
      return giaiMa.toString('utf8');
    } catch {
      return '';
    }
  }

  private laKhoaBiMat(khoa: string): boolean {
    const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[khoa];
    return Boolean(
      dinhNghia?.biMat ||
        khoa === 'AI_API_KEY' ||
        khoa === 'tro_ly_ai.khoa_bi_mat_api' ||
        khoa === 'email.mat_khau_ung_dung_smtp',
    );
  }

  private laGiaTriMatNa(giaTri: string): boolean {
    if (!giaTri) return false;
    const cat = giaTri.trim();
    return cat === MAT_NA_KHOA_BI_MAT || /^[•*]+$/.test(cat);
  }

  private cheGiaTriBiMatChoClient(item: CaiDatHeThong): CaiDatHeThong {
    if (item.khoa === 'email.tai_khoan_smtp') {
      const emailThuong = (item.giaTri || '').trim().toLowerCase();
      if (
        emailThuong === 'admin@lms.edu.vn' ||
        emailThuong === 'bangiamhieu@lms.edu.vn' ||
        emailThuong === 'giaovu@lms.edu.vn' ||
        emailThuong === 'giaovien1@lms.edu.vn' ||
        emailThuong === 'hocsinh1@lms.edu.vn' ||
        emailThuong === 'phuhuynh1@lms.edu.vn'
      ) {
        return { ...item, giaTri: '' };
      }
      return item;
    }

    if (!this.laKhoaBiMat(item.khoa)) {
      return item;
    }
    const giaTriThuc = this.giaiMaGiaTriBiMat(item.giaTri);
    if (item.khoa === 'email.mat_khau_ung_dung_smtp' && giaTriThuc.trim() === 'MatKhau@123') {
      return { ...item, giaTri: '' };
    }
    return {
      ...item,
      giaTri: giaTriThuc && giaTriThuc.trim().length > 0 ? MAT_NA_KHOA_BI_MAT : '',
    };
  }

  /**
   * Kiểm tra và làm sạch giá trị cài đặt trước khi lưu (chống XSS, SSRF, ngoài khoảng min/max, đuôi tệp độc hại)
   */
  private kiemTraVaChuanHoaGiaTri(khoa: string, giaTri: string): string {
    const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[khoa];
    let giaTriSach = typeof giaTri === 'string' ? giaTri : String(giaTri ?? '');

    // 1. Khử mã độc XSS trên các trường văn bản thông báo
    if (
      khoa.startsWith('thong_bao.') ||
      khoa === 'THONG_BAO_CHUNG' ||
      khoa.startsWith('chung.') ||
      khoa === 'TEN_HE_THONG' ||
      khoa === 'TEN_TRUONG' ||
      khoa === 'KHAU_HIEU'
    ) {
      giaTriSach = giaTriSach
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }

    // 2. Chống SSRF cho máy chủ SMTP
    if (khoa === 'email.may_chu_smtp' && giaTriSach.trim().length > 0) {
      const host = giaTriSach.trim().toLowerCase();
      const biChanSsrf =
        host === 'localhost' ||
        host.startsWith('127.') ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host === '[::1]' ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
        host.includes('metadata.google.internal');

      if (biChanSsrf) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep:
            'Địa chỉ máy chủ SMTP không được trỏ vào mạng nội bộ hoặc localhost (Chống SSRF).',
        });
      }
    }

    // 3. Chặn đuôi tệp thực thi nguy hiểm trong danh sách định dạng tệp cho phép
    if (khoa === 'bai_tap.dinh_dang_tep_cho_phep') {
      const danhSachDuoi = giaTriSach
        .split(',')
        .map((d) => d.trim().toLowerCase().replace(/^\./, ''))
        .filter((d) => d.length > 0 && /^[a-z0-9]+$/.test(d) && !DUOI_TEP_THUC_THI_CAM.has(d));

      if (danhSachDuoi.length === 0) {
        return 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,png,jpg,jpeg';
      }
      return Array.from(new Set(danhSachDuoi)).join(',');
    }

    // 4. Kiểm tra kiểu dữ liệu theo danh mục chuẩn
    if (dinhNghia) {
      if (dinhNghia.kieu === 'boolean') {
        return giaTriSach === 'true' ? 'true' : 'false';
      }

      if (dinhNghia.kieu === 'number') {
        const so = Number(giaTriSach);
        if (Number.isNaN(so)) {
          throw new BadRequestException({
            thanhCong: false,
            maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
            thongDiep: `Giá trị của '${dinhNghia.nhan}' phải là một số hợp lệ.`,
          });
        }
        if (dinhNghia.min !== undefined && so < dinhNghia.min) {
          throw new BadRequestException({
            thanhCong: false,
            maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
            thongDiep: `Giá trị của '${dinhNghia.nhan}' không được nhỏ hơn ${dinhNghia.min}.`,
          });
        }
        if (dinhNghia.max !== undefined && so > dinhNghia.max) {
          throw new BadRequestException({
            thanhCong: false,
            maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
            thongDiep: `Giá trị của '${dinhNghia.nhan}' không được vượt quá ${dinhNghia.max}.`,
          });
        }
      }

      if (dinhNghia.kieu === 'color') {
        const kqMau = kiemTraMauChuDaoHopLe(giaTriSach);
        if (!kqMau.hopLe) {
          throw new BadRequestException({
            thanhCong: false,
            maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
            thongDiep: kqMau.thongDiep || `Mã màu '${giaTriSach}' không hợp lệ.`,
          });
        }
        return giaTriSach.trim().toUpperCase();
      }

      if (dinhNghia.kieu === 'json') {
        try {
          const parsed = JSON.parse(giaTriSach);
          if (!Array.isArray(parsed)) {
            throw new Error('Phải là mảng JSON');
          }
        } catch {
          throw new BadRequestException({
            thanhCong: false,
            maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
            thongDiep: `Giá trị của '${dinhNghia.nhan}' không đúng định dạng cấu trúc JSON hợp lệ.`,
          });
        }
      }
    }

    return giaTriSach;
  }

  /**
   * Lấy toàn bộ danh sách cài đặt hệ thống (Dành cho Quản trị viên, đã che khóa bí mật)
   */
  async layDanhSachCaiDat(): Promise<CaiDatHeThong[]> {
    const danhSach = await this.khoCaiDat.layDanhSach();
    return danhSach.map((item) => this.cheGiaTriBiMatChoClient(item));
  }

  /**
   * Lấy bản đồ cấu hình nội bộ đã giải mã khóa bí mật (CHỈ dùng cho các Service phía Backend)
   */
  async layBanDoCaiDatNoiBo(): Promise<BanDoCaiDat> {
    const danhSach = await this.khoCaiDat.layDanhSach();
    const banDo: BanDoCaiDat = {};
    for (const dinhNghia of DANH_MUC_CAI_DAT_HE_THONG) {
      banDo[dinhNghia.khoa] = dinhNghia.macDinh;
      if (dinhNghia.khoaCu) {
        banDo[dinhNghia.khoaCu] = dinhNghia.macDinh;
      }
    }
    for (const item of danhSach) {
      const giaTri = this.laKhoaBiMat(item.khoa)
        ? this.giaiMaGiaTriBiMat(item.giaTri)
        : item.giaTri;
      banDo[item.khoa] = giaTri;
    }
    return banDo;
  }

  /**
   * Đọc nhanh một số thực/nguyên từ cài đặt hệ thống (kèm mặc định an toàn)
   */
  async layGiaTriSo(khoa: string, macDinh: number): Promise<number> {
    try {
      const banGhi = await this.khoCaiDat.layTheoKhoa(khoa);
      if (!banGhi) return macDinh;
      const so = Number(banGhi.giaTri);
      return Number.isNaN(so) ? macDinh : so;
    } catch {
      return macDinh;
    }
  }

  /**
   * Đọc nhanh một giá trị logic (boolean) từ cài đặt hệ thống
   */
  async layGiaTriBoolean(khoa: string, macDinh: boolean): Promise<boolean> {
    try {
      const banGhi = await this.khoCaiDat.layTheoKhoa(khoa);
      if (!banGhi) return macDinh;
      return banGhi.giaTri === 'true';
    } catch {
      return macDinh;
    }
  }

  /**
   * Đọc nhanh chuỗi văn bản từ cài đặt hệ thống (tự động giải mã nếu là khóa bí mật)
   */
  async layGiaTriChuoi(khoa: string, macDinh = ''): Promise<string> {
    try {
      const banGhi = await this.khoCaiDat.layTheoKhoa(khoa);
      if (!banGhi) return macDinh;
      if (this.laKhoaBiMat(khoa)) {
        return this.giaiMaGiaTriBiMat(banGhi.giaTri) || macDinh;
      }
      return banGhi.giaTri ?? macDinh;
    } catch {
      return macDinh;
    }
  }

  /**
   * Lấy bản đồ cấu hình công khai (Key-Value) cho cổng thông tin, màn hình đăng nhập và thanh bên
   */
  async layBanDoCaiDatCongKhai(): Promise<BanDoCaiDat> {
    const danhSach = await this.khoCaiDat.layDanhSachCongKhai();
    const banDo: BanDoCaiDat = {};
    for (const item of danhSach) {
      if (this.laKhoaBiMat(item.khoa)) continue;
      banDo[item.khoa] = item.giaTri;
    }
    return banDo;
  }

  /**
   * Lấy chi tiết một cài đặt theo khóa (đã che mặt nạ nếu là khóa bí mật)
   */
  async layTheoKhoa(khoa: string): Promise<CaiDatHeThong> {
    const caiDat = await this.khoCaiDat.layTheoKhoa(khoa);
    if (!caiDat) {
      throw new NotFoundException(`Không tìm thấy cấu hình với mã '${khoa}'`);
    }
    return this.cheGiaTriBiMatChoClient(caiDat);
  }

  /**
   * Cập nhật hàng loạt nhiều cài đặt
   */
  async capNhatNhieu(
    danhSach: Array<{ khoa: string; giaTri: string }>,
    idNguoiDung?: string,
    diaChiIp?: string,
  ): Promise<{ soLuong: number }> {
    const danhSachHopLe: Array<{ khoa: string; giaTri: string }> = [];

    for (const item of danhSach) {
      if (this.laKhoaBiMat(item.khoa)) {
        // Nếu trình duyệt gửi lại chuỗi mặt nạ ••••••••, giữ nguyên khóa bí mật hiện có trong DB
        if (this.laGiaTriMatNa(item.giaTri)) {
          continue;
        }
        const giaTriMaHoa = item.giaTri.trim()
          ? this.maHoaGiaTriBiMat(item.giaTri.trim())
          : '';
        danhSachHopLe.push({ khoa: item.khoa, giaTri: giaTriMaHoa });
      } else {
        const giaTriChuan = this.kiemTraVaChuanHoaGiaTri(item.khoa, item.giaTri);
        danhSachHopLe.push({ khoa: item.khoa, giaTri: giaTriChuan });
      }
    }

    if (danhSachHopLe.length === 0) {
      return { soLuong: 0 };
    }

    const soLuong = await this.khoCaiDat.capNhatNhieu(danhSachHopLe);

    await this.khoCaiDat.ghiNhatKyHeThong?.({
      idNguoiDung,
      hanhDong: 'CAP_NHAT_CAI_DAT_HE_THONG',
      thucThe: 'CaiDatHeThong',
      diaChiIp,
      chiTiet: {
        soLuong,
        danhSachKhoa: danhSachHopLe.map((d) => d.khoa),
      },
    });

    return { soLuong };
  }

  /**
   * Cập nhật một cài đặt theo khóa
   */
  async capNhatMot(
    khoa: string,
    giaTri: string,
    idNguoiDung?: string,
    diaChiIp?: string,
  ): Promise<CaiDatHeThong> {
    if (this.laKhoaBiMat(khoa)) {
      if (this.laGiaTriMatNa(giaTri)) {
        const hienTai = await this.khoCaiDat.layTheoKhoa(khoa);
        if (hienTai) return this.cheGiaTriBiMatChoClient(hienTai);
      }
      const giaTriMaHoa = giaTri.trim() ? this.maHoaGiaTriBiMat(giaTri.trim()) : '';
      const capNhat = await this.khoCaiDat.capNhat(khoa, giaTriMaHoa);
      await this.khoCaiDat.ghiNhatKyHeThong?.({
        idNguoiDung,
        hanhDong: 'CAP_NHAT_MOT_CAI_DAT_BI_MAT',
        thucThe: 'CaiDatHeThong',
        idThucThe: khoa,
        diaChiIp,
      });
      return this.cheGiaTriBiMatChoClient(capNhat);
    }

    const giaTriChuan = this.kiemTraVaChuanHoaGiaTri(khoa, giaTri);
    const ketQua = await this.khoCaiDat.capNhat(khoa, giaTriChuan);

    await this.khoCaiDat.ghiNhatKyHeThong?.({
      idNguoiDung,
      hanhDong: 'CAP_NHAT_MOT_CAI_DAT',
      thucThe: 'CaiDatHeThong',
      idThucThe: khoa,
      diaChiIp,
      chiTiet: { khoa, giaTriMoi: giaTriChuan },
    });

    return ketQua;
  }

  /**
   * Khôi phục cài đặt về giá trị mặc định chuẩn theo nhóm hoặc danh sách khóa
   */
  async khoiPhucMacDinh(
    duLieu: KhoiPhucCaiDatInput,
    idNguoiDung?: string,
    diaChiIp?: string,
  ): Promise<{ soLuong: number; danhSachKhoa: string[] }> {
    const mucCanKhoiPhuc = DANH_MUC_CAI_DAT_HE_THONG.filter((d) => {
      // Không tự động xóa khóa bí mật khi khôi phục nhóm trừ khi truyền đích danh khóa đó
      if (d.biMat && (!duLieu.danhSachKhoa || !duLieu.danhSachKhoa.includes(d.khoa))) {
        return false;
      }
      if (duLieu.danhSachKhoa && duLieu.danhSachKhoa.length > 0) {
        return (
          duLieu.danhSachKhoa.includes(d.khoa) ||
          Boolean(d.khoaCu && duLieu.danhSachKhoa.includes(d.khoaCu))
        );
      }
      if (duLieu.nhom) {
        return d.nhom === duLieu.nhom.toLowerCase();
      }
      return true;
    });

    const danhSachCapNhat = mucCanKhoiPhuc.map((d) => ({
      khoa: d.khoa,
      giaTri: d.macDinh,
    }));

    const soLuong =
      danhSachCapNhat.length > 0 ? await this.khoCaiDat.capNhatNhieu(danhSachCapNhat) : 0;

    await this.khoCaiDat.ghiNhatKyHeThong?.({
      idNguoiDung,
      hanhDong: 'KHOI_PHUC_CAI_DAT_MAC_DINH',
      thucThe: 'CaiDatHeThong',
      diaChiIp,
      chiTiet: {
        nhom: duLieu.nhom || 'TAT_CA',
        soLuong,
        danhSachKhoa: danhSachCapNhat.map((d) => d.khoa),
      },
    });

    return {
      soLuong,
      danhSachKhoa: danhSachCapNhat.map((d) => d.khoa),
    };
  }

  /**
   * Kiểm tra kết nối máy chủ SMTP an toàn (chống SSRF, đo độ trễ kết nối TCP)
   */
  async kiemTraKetNoiSmtp(duLieu: KiemTraKetNoiSmtpInput) {
    const banDo = await this.layBanDoCaiDatNoiBo();
    const mayChu = (duLieu.mayChuSmtp || banDo['email.may_chu_smtp'] || 'smtp.gmail.com').trim();
    const cong = Number(duLieu.congSmtp || banDo['email.cong_smtp'] || 587);

    // Kiểm tra chống SSRF
    this.kiemTraVaChuanHoaGiaTri('email.may_chu_smtp', mayChu);

    if (![25, 465, 587, 2525].includes(cong)) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Chỉ cho phép kiểm tra các cổng SMTP tiêu chuẩn (465, 587, 2525, 25).',
      });
    }

    const batDau = Date.now();
    const ketQuaTcp = await new Promise<{
      thanhCong: boolean;
      thongDiep: string;
      doTreMs: number;
    }>((resolve) => {
      const socket = new net.Socket();
      let daKetThuc = false;

      const hoanTat = (thanhCong: boolean, thongDiep: string) => {
        if (daKetThuc) return;
        daKetThuc = true;
        socket.destroy();
        resolve({
          thanhCong,
          thongDiep,
          doTreMs: Date.now() - batDau,
        });
      };

      socket.setTimeout(6000);
      socket.once('connect', () => {
        hoanTat(
          true,
          `Kết nối mạng tới máy chủ ${mayChu}:${cong} thành công (${Date.now() - batDau}ms).`,
        );
      });
      socket.once('timeout', () => {
        hoanTat(false, `Quá thời gian chờ (6 giây) khi kết nối tới ${mayChu}:${cong}.`);
      });
      socket.once('error', (err) => {
        hoanTat(false, `Không thể kết nối tới ${mayChu}:${cong} (${err.message}).`);
      });

      socket.connect(cong, mayChu);
    });

    if (ketQuaTcp.thanhCong && duLieu.emailNhanThuNghiem?.trim()) {
      const ketQuaGui = await this.guiEmailSmtpThucTe({
        emailNguoiNhan: duLieu.emailNhanThuNghiem.trim(),
        tieuDe: '[LMS] Kiểm tra kết nối gửi thông báo Gmail SMTP',
        noiDungHtml: this.taoKhungEmailHtmlThongBao({
          nhanPhanLoai: 'KIỂM TRA SMTP',
          tieuDe: 'Xác nhận kết nối máy chủ gửi thư Gmail SMTP',
          noiDung: `Máy chủ ${mayChu}:${cong} đã kết nối và xác thực thành công. Các thông báo mới, bài tập mới và kết quả chấm điểm sẽ được chuyển tiếp tự động tới hộp thư Gmail của từng tài khoản.`,
          duongDan: '/cai-dat',
          tenHeThong: banDo['chung.ten_he_thong'] || 'Hệ thống Quản lý Học tập LMS',
        }),
        mayChuGhiDe: mayChu,
        congGhiDe: cong,
        boQuaCoKichHoat: true,
      });

      if (ketQuaGui.daGui) {
        return {
          ...ketQuaTcp,
          thongDiep: `${ketQuaTcp.thongDiep} Đã gửi thư thử nghiệm tới ${duLieu.emailNhanThuNghiem.trim()}.`,
        };
      }
    }

    return ketQuaTcp;
  }

  /**
   * Khung HTML chuẩn Warm Minimal + Monospace cho email thông báo Gmail
   */
  taoKhungEmailHtmlThongBao(thamSo: {
    nhanPhanLoai: string;
    tieuDe: string;
    noiDung: string;
    duongDan?: string | null;
    tenNguoiNhan?: string;
    tenHeThong?: string;
  }): string {
    const tenHeThong = thamSo.tenHeThong || 'Hệ thống Quản lý Học tập LMS';
    const urlNenTang = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const lienKet = thamSo.duongDan
      ? thamSo.duongDan.startsWith('http')
        ? thamSo.duongDan
        : `${urlNenTang}${thamSo.duongDan.startsWith('/') ? '' : '/'}${thamSo.duongDan}`
      : urlNenTang;
    const thoiGian = new Date().toLocaleString('vi-VN', { hour12: false });

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>${thamSo.tieuDe}</title>
</head>
<body style="margin:0;padding:24px;background-color:#FAF8F4;font-family:'Be Vietnam Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2B2A27;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#FFFDF8;border:1px solid #E5E2DA;border-radius:4px;">
    <tr>
      <td style="padding:20px 24px;border-bottom:1px solid #E5E2DA;background-color:#F3EDE4;">
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#059669;font-weight:700;">
          ${thamSo.nhanPhanLoai} · ${tenHeThong}
        </div>
        <h1 style="margin:8px 0 0 0;font-family:'JetBrains Mono',monospace;font-size:18px;line-height:1.4;color:#2B2A27;">
          ${thamSo.tieuDe}
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        ${thamSo.tenNguoiNhan ? `<p style="margin:0 0 12px 0;font-size:14px;color:#7A766D;">Xin chào <strong style="color:#2B2A27;">${thamSo.tenNguoiNhan}</strong>,</p>` : ''}
        <div style="padding:16px;background-color:#FAF8F4;border:1px solid #E5E2DA;border-left:3px solid #059669;border-radius:4px;font-size:14px;line-height:1.65;color:#2B2A27;">
          ${thamSo.noiDung}
        </div>
        <div style="margin-top:20px;">
          <a href="${lienKet}" style="display:inline-block;padding:10px 18px;background-color:#059669;color:#FFFDF8;text-decoration:none;border-radius:4px;font-size:13px;font-weight:600;">
            Mở xem trên nền tảng LMS
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 24px;border-top:1px solid #E5E2DA;font-family:'JetBrains Mono',monospace;font-size:11px;color:#7A766D;">
        Thời gian ghi nhận: ${thoiGian} · Kênh: Nền tảng, Windows &amp; Gmail
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Gửi thư điện tử thực tế qua giao thức SMTP / STARTTLS / TLS (tương thích Gmail smtp.gmail.com:587 & 465)
   */
  async guiEmailSmtpThucTe(thamSo: {
    emailNguoiNhan: string;
    tieuDe: string;
    noiDungHtml: string;
    mayChuGhiDe?: string;
    congGhiDe?: number;
    boQuaCoKichHoat?: boolean;
  }): Promise<{ daGui: boolean; thongDiep: string }> {
    const emailDich = (thamSo.emailNguoiNhan || '').trim();
    if (!emailDich || !emailDich.includes('@')) {
      return { daGui: false, thongDiep: 'Địa chỉ email người nhận không hợp lệ.' };
    }

    const banDo = await this.layBanDoCaiDatNoiBo();
    const kichHoatSmtp =
      thamSo.boQuaCoKichHoat ||
      banDo['email.kich_hoat_smtp'] === 'true' ||
      process.env.SMTP_ENABLED === 'true';

    if (!kichHoatSmtp) {
      return {
        daGui: false,
        thongDiep: 'Tính năng gửi email SMTP đang tắt trong Cài đặt hệ thống.',
      };
    }

    const mayChu = (
      thamSo.mayChuGhiDe ||
      banDo['email.may_chu_smtp'] ||
      process.env.SMTP_HOST ||
      'smtp.gmail.com'
    ).trim();
    const cong = Number(
      thamSo.congGhiDe || banDo['email.cong_smtp'] || process.env.SMTP_PORT || 587,
    );
    const taiKhoanRaw = (banDo['email.tai_khoan_smtp'] || process.env.SMTP_USER || '').trim();
    const matKhauRaw = (
      banDo['email.mat_khau_ung_dung_smtp'] ||
      process.env.SMTP_PASS ||
      ''
    ).trim();

    const taiKhoanMau = new Set([
      'admin@lms.edu.vn',
      'bangiamhieu@lms.edu.vn',
      'giaovu@lms.edu.vn',
      'giaovien1@lms.edu.vn',
      'hocsinh1@lms.edu.vn',
      'phuhuynh1@lms.edu.vn',
    ]);
    const taiKhoan = taiKhoanMau.has(taiKhoanRaw.toLowerCase()) ? '' : taiKhoanRaw;
    const matKhau = matKhauRaw === 'MatKhau@123' ? '' : matKhauRaw.replace(/\s+/g, '');

    if (!taiKhoan || !matKhau) {
      return {
        daGui: false,
        thongDiep:
          'Chưa cấu hình Tài khoản Gmail & Mật khẩu ứng dụng SMTP thực tế tại mục Cài đặt hệ thống (/cai-dat).',
      };
    }

    this.kiemTraVaChuanHoaGiaTri('email.may_chu_smtp', mayChu);

    const tenHienThi = (
      banDo['email.ten_hien_thi_gui'] ||
      banDo['chung.ten_he_thong'] ||
      'Hệ thống Quản lý Học tập LMS'
    ).trim();
    const emailPhanHoi = (banDo['email.dia_chi_phan_hoi'] || taiKhoan).trim();

    return new Promise<{ daGui: boolean; thongDiep: string }>((resolve) => {
      let daXong = false;
      let ketNoiHienTai: net.Socket | tls.TLSSocket | null = null;

      const ketThuc = (daGui: boolean, thongDiep: string) => {
        if (daXong) return;
        daXong = true;
        try {
          ketNoiHienTai?.destroy();
        } catch {
          // Bỏ qua lỗi đóng socket
        }
        resolve({ daGui, thongDiep });
      };

      const docPhanHoiSmtp = (socket: net.Socket | tls.TLSSocket): Promise<string> =>
        new Promise((res, rej) => {
          let boDem = '';
          const khiCoDuLieu = (chunk: Buffer) => {
            boDem += chunk.toString('utf8');
            const cacDong = boDem.split(/\r?\n/).filter((d) => d.length > 0);
            const dongCuoi = cacDong[cacDong.length - 1] || '';
            if (/^\d{3} /.test(dongCuoi)) {
              socket.off('data', khiCoDuLieu);
              socket.off('error', khiLoi);
              res(boDem);
            }
          };
          const khiLoi = (err: Error) => {
            socket.off('data', khiCoDuLieu);
            rej(err);
          };
          socket.on('data', khiCoDuLieu);
          socket.once('error', khiLoi);
        });

      const guiLenhSmtp = async (
        socket: net.Socket | tls.TLSSocket,
        lenh: string,
        maKyVong: string[],
      ) => {
        socket.write(`${lenh}\r\n`);
        const phanHoi = await docPhanHoiSmtp(socket);
        const hopLe = maKyVong.some((ma) => phanHoi.startsWith(ma));
        if (!hopLe) {
          throw new Error(`SMTP từ chối (${phanHoi.trim()})`);
        }
        return phanHoi;
      };

      const thucThiPhienSmtp = async () => {
        try {
          if (cong === 465) {
            ketNoiHienTai = tls.connect({
              host: mayChu,
              port: cong,
              servername: mayChu,
              timeout: 8000,
            });
          } else {
            ketNoiHienTai = net.connect({ host: mayChu, port: cong, timeout: 8000 });
          }

          ketNoiHienTai.setTimeout(8000);
          ketNoiHienTai.once('timeout', () =>
            ketThuc(false, `Quá thời gian chờ SMTP (${mayChu}:${cong}).`),
          );
          ketNoiHienTai.once('error', (err) =>
            ketThuc(false, `Lỗi kết nối SMTP: ${err.message}`),
          );

          await docPhanHoiSmtp(ketNoiHienTai);
          await guiLenhSmtp(ketNoiHienTai, 'EHLO lms.edu.vn', ['250']);

          if (cong !== 465) {
            await guiLenhSmtp(ketNoiHienTai, 'STARTTLS', ['220']);
            const socketThuong = ketNoiHienTai;
            ketNoiHienTai = await new Promise<tls.TLSSocket>((res, rej) => {
              const tlsSock = tls.connect(
                { socket: socketThuong, servername: mayChu },
                () => res(tlsSock),
              );
              tlsSock.once('error', rej);
            });
            await guiLenhSmtp(ketNoiHienTai, 'EHLO lms.edu.vn', ['250']);
          }

          await guiLenhSmtp(ketNoiHienTai, 'AUTH LOGIN', ['334']);
          await guiLenhSmtp(
            ketNoiHienTai,
            Buffer.from(taiKhoan, 'utf8').toString('base64'),
            ['334'],
          );
          await guiLenhSmtp(
            ketNoiHienTai,
            Buffer.from(matKhau, 'utf8').toString('base64'),
            ['235'],
          );

          await guiLenhSmtp(ketNoiHienTai, `MAIL FROM:<${taiKhoan}>`, ['250']);
          await guiLenhSmtp(ketNoiHienTai, `RCPT TO:<${emailDich}>`, ['250', '251']);
          await guiLenhSmtp(ketNoiHienTai, 'DATA', ['354']);

          const tieuDeMaHoa = `=?UTF-8?B?${Buffer.from(thamSo.tieuDe, 'utf8').toString('base64')}?=`;
          const tenGuiMaHoa = `=?UTF-8?B?${Buffer.from(tenHienThi, 'utf8').toString('base64')}?=`;
          const noiDungBase64 =
            Buffer.from(thamSo.noiDungHtml, 'utf8')
              .toString('base64')
              .match(/.{1,76}/g)
              ?.join('\r\n') || '';

          const goiTinMime = [
            `From: "${tenGuiMaHoa}" <${taiKhoan}>`,
            `To: <${emailDich}>`,
            `Reply-To: <${emailPhanHoi}>`,
            `Subject: ${tieuDeMaHoa}`,
            `Date: ${new Date().toUTCString()}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            `Content-Transfer-Encoding: base64`,
            ``,
            noiDungBase64,
            `.`,
          ].join('\r\n');

          await guiLenhSmtp(ketNoiHienTai, goiTinMime, ['250']);
          try {
            await guiLenhSmtp(ketNoiHienTai, 'QUIT', ['221']);
          } catch {
            // Không bắt buộc chờ QUIT
          }

          ketThuc(true, `Đã gửi thông báo Gmail thành công tới ${emailDich}.`);
        } catch (err) {
          const thongDiepLoi = err instanceof Error ? err.message : 'Lỗi không xác định';
          ketThuc(false, `Không thể gửi thư Gmail tới ${emailDich}: ${thongDiepLoi}`);
        }
      };

      void thucThiPhienSmtp();
    });
  }

  /**
   * Phát thông báo đa kênh (1. Nền tảng LMS, 2. Màn hình Windows OS, 3. Hộp thư Gmail) cho danh sách tài khoản
   */
  async phatThongBaoDaKenhChoNguoiDung(thamSo: {
    danhSachIdNguoiDung: string[];
    tieuDe: string;
    noiDung: string;
    duongDan?: string | null;
    loaiSuKien:
      | 'BAI_DANG'
      | 'BAI_TAP_MOI'
      | 'BAI_KIEM_TRA_MOI'
      | 'CHAM_DIEM'
      | 'NHAC_HAN'
      | 'HE_THONG'
      | 'KIEM_THU';
    nhanPhanLoai?: string;
    boQuaKiemTraTuyChon?: boolean;
  }): Promise<{
    soTaiKhoanNhanNenTang: number;
    soEmailGmailDaGui: number;
    chiTietGmail: string;
    idThongBaoDauTien?: string;
  }> {
    if (!this.prisma) {
      return {
        soTaiKhoanNhanNenTang: 0,
        soEmailGmailDaGui: 0,
        chiTietGmail: 'Chưa kết nối dịch vụ cơ sở dữ liệu.',
      };
    }

    const danhSachIdDuyNhat = Array.from(
      new Set((thamSo.danhSachIdNguoiDung || []).filter(Boolean)),
    );
    if (danhSachIdDuyNhat.length === 0) {
      return {
        soTaiKhoanNhanNenTang: 0,
        soEmailGmailDaGui: 0,
        chiTietGmail: 'Không có người nhận trong danh sách.',
      };
    }

    const danhSachNguoiDung = await this.prisma.nguoiDung.findMany({
      where: {
        id: { in: danhSachIdDuyNhat },
        kichHoat: true,
        ngayXoa: null,
      },
      select: {
        id: true,
        email: true,
        hoTen: true,
      },
    });

    const banDoHeThong = await this.layBanDoCaiDatNoiBo();
    const choPhepInAppHeThong = banDoHeThong['thong_bao.cho_phep_thong_bao_in_app'] !== 'false';
    const tenHeThong = banDoHeThong['chung.ten_he_thong'] || 'Hệ thống Quản lý Học tập LMS';

    let soTaiKhoanNhanNenTang = 0;
    let soEmailGmailDaGui = 0;
    let chiTietGmail = 'Chưa kích hoạt gửi Gmail.';
    let idThongBaoDauTien: string | undefined;

    const nhanSuKienMacDinh: Record<string, string> = {
      BAI_DANG: 'THÔNG BÁO LỚP HỌC',
      BAI_TAP_MOI: 'BÀI TẬP MỚI',
      BAI_KIEM_TRA_MOI: 'BÀI KIỂM TRA MỚI',
      CHAM_DIEM: 'KẾT QUẢ HỌC TẬP',
      NHAC_HAN: 'NHẮC HẠN DEADLINE',
      HE_THONG: 'THÔNG BÁO HỆ THỐNG',
      KIEM_THU: 'KIỂM TRA ĐA KÊNH',
    };
    const nhanPhanLoai =
      thamSo.nhanPhanLoai || nhanSuKienMacDinh[thamSo.loaiSuKien] || 'THÔNG BÁO LMS';

    for (const nguoiDung of danhSachNguoiDung) {
      const tuyChon = await this.layTuyChonCaNhan(nguoiDung.id);
      const tb = tuyChon.thongBao;

      // Kiểm tra người dùng có bật nhận loại sự kiện tương ứng hay không
      let batLoaiSuKien = true;
      if (!thamSo.boQuaKiemTraTuyChon) {
        if (thamSo.loaiSuKien === 'BAI_DANG') {
          batLoaiSuKien = tb.lichHocVaPhongTrucTuyen !== false;
        } else if (
          thamSo.loaiSuKien === 'BAI_TAP_MOI' ||
          thamSo.loaiSuKien === 'BAI_KIEM_TRA_MOI' ||
          thamSo.loaiSuKien === 'NHAC_HAN'
        ) {
          batLoaiSuKien = tb.baiTapVaHanNop !== false;
        } else if (thamSo.loaiSuKien === 'CHAM_DIEM') {
          batLoaiSuKien = tb.diemSoVaKetQua !== false;
        }
      }

      if (!batLoaiSuKien) {
        continue;
      }

      // 1. Kênh Nền tảng (In-App) & 2. Kênh Windows OS (đồng bộ qua bảng ThongBao)
      const batNenTangHoacWindows =
        thamSo.boQuaKiemTraTuyChon ||
        (choPhepInAppHeThong && (tb.kenhNenTang !== false || tb.kenhWindows !== false));

      if (batNenTangHoacWindows) {
        const loaiDb =
          thamSo.loaiSuKien === 'BAI_DANG'
            ? 'LOP_HOC'
            : thamSo.loaiSuKien === 'BAI_TAP_MOI' || thamSo.loaiSuKien === 'BAI_KIEM_TRA_MOI'
              ? 'BAI_TAP'
              : thamSo.loaiSuKien === 'CHAM_DIEM'
                ? 'DIEM_SO'
                : thamSo.loaiSuKien === 'NHAC_HAN'
                  ? 'NHAC_NHO'
                  : 'HE_THONG';

        const banGhiMoi = await this.prisma.thongBao.create({
          data: {
            idNguoiDung: nguoiDung.id,
            tieuDe: thamSo.tieuDe.slice(0, 200),
            noiDung: thamSo.noiDung,
            loai: loaiDb,
            daDoc: false,
            lienKet: thamSo.duongDan ? thamSo.duongDan.slice(0, 255) : null,
          },
        });
        soTaiKhoanNhanNenTang += 1;
        if (!idThongBaoDauTien) {
          idThongBaoDauTien = banGhiMoi.id;
        }
      }

      // 3. Kênh Gmail / Email SMTP
      const batKenhGmail = thamSo.boQuaKiemTraTuyChon || tb.kenhGmail !== false;
      const emailNhan = (tb.emailNhanThongBao?.trim() || nguoiDung.email || '').trim();

      if (batKenhGmail && emailNhan) {
        const noiDungHtml = this.taoKhungEmailHtmlThongBao({
          nhanPhanLoai,
          tieuDe: thamSo.tieuDe,
          noiDung: thamSo.noiDung,
          duongDan: thamSo.duongDan,
          tenNguoiNhan: nguoiDung.hoTen,
          tenHeThong,
        });

        const ketQuaEmail = await this.guiEmailSmtpThucTe({
          emailNguoiNhan: emailNhan,
          tieuDe: `[${nhanPhanLoai}] ${thamSo.tieuDe}`,
          noiDungHtml,
          boQuaCoKichHoat: thamSo.boQuaKiemTraTuyChon,
        });

        chiTietGmail = ketQuaEmail.thongDiep;
        if (ketQuaEmail.daGui) {
          soEmailGmailDaGui += 1;
        }
      } else if (!batKenhGmail) {
        chiTietGmail = 'Người dùng đã tắt kênh nhận thông báo qua Gmail.';
      }
    }

    return {
      soTaiKhoanNhanNenTang,
      soEmailGmailDaGui,
      chiTietGmail,
      idThongBaoDauTien,
    };
  }

  /**
   * Phát thông báo đa kênh (Nền tảng, Windows, Gmail) tới toàn bộ thành viên (Học sinh, Giáo viên, Phụ huynh) trong một Lớp học phần
   */
  async phatThongBaoChoLopHocPhan(thamSo: {
    idLopHocPhan: string;
    idNguoiTao?: string;
    tieuDe: string;
    noiDung: string;
    duongDan?: string | null;
    loaiSuKien: 'BAI_DANG' | 'BAI_TAP_MOI' | 'BAI_KIEM_TRA_MOI' | 'HE_THONG';
    nhanPhanLoai?: string;
  }) {
    if (!this.prisma) return;
    try {
      const [lop, danhSachGhiDanh] = await Promise.all([
        this.prisma.lopHocPhan.findUnique({
          where: { id: thamSo.idLopHocPhan },
          select: {
            giaoVien: { select: { idNguoiDung: true } },
          },
        }),
        this.prisma.ghiDanh.findMany({
          where: { idLopHocPhan: thamSo.idLopHocPhan },
          select: {
            idHocSinh: true,
            hocSinh: { select: { idNguoiDung: true } },
          },
        }),
      ]);

      const danhSachIdHoSoHocSinh = danhSachGhiDanh.map((gd) => gd.idHocSinh);
      const danhSachPhuHuynh =
        danhSachIdHoSoHocSinh.length > 0
          ? await this.prisma.phuHuynhHocSinh.findMany({
              where: { idHocSinh: { in: danhSachIdHoSoHocSinh } },
              select: { idPhuHuynh: true },
            })
          : [];

      const tapNguoiNhan = new Set<string>();
      if (lop?.giaoVien?.idNguoiDung) {
        tapNguoiNhan.add(lop.giaoVien.idNguoiDung);
      }
      for (const gd of danhSachGhiDanh) {
        if (gd.hocSinh?.idNguoiDung) {
          tapNguoiNhan.add(gd.hocSinh.idNguoiDung);
        }
      }
      for (const ph of danhSachPhuHuynh) {
        if (ph.idPhuHuynh) {
          tapNguoiNhan.add(ph.idPhuHuynh);
        }
      }

      if (thamSo.idNguoiTao) {
        tapNguoiNhan.delete(thamSo.idNguoiTao);
      }

      const danhSachId = Array.from(tapNguoiNhan);
      if (danhSachId.length === 0) return;

      await this.phatThongBaoDaKenhChoNguoiDung({
        danhSachIdNguoiDung: danhSachId,
        tieuDe: thamSo.tieuDe,
        noiDung: thamSo.noiDung,
        duongDan: thamSo.duongDan,
        loaiSuKien: thamSo.loaiSuKien,
        nhanPhanLoai: thamSo.nhanPhanLoai,
      });
    } catch {
      // Không làm gián đoạn luồng tạo bài đăng/bài tập chính nếu gửi thông báo phụ gặp sự cố
    }
  }

  /**
   * Đọc tùy chọn cá nhân của một người dùng (Giao diện, Thông báo, Quyền riêng tư, Trợ lý AI)
   */
  async layTuyChonCaNhan(idNguoiDung: string): Promise<TuyChonCaNhan> {
    const khoa = `ca_nhan.tuy_chon.${idNguoiDung}`;
    const banGhi = await this.khoCaiDat.layTheoKhoa(khoa);
    if (!banGhi || !banGhi.giaTri) {
      return TUY_CHON_CA_NHAN_MAC_DINH;
    }
    try {
      const daLuu = JSON.parse(banGhi.giaTri);
      return {
        cheDoGiaoDien: daLuu.cheDoGiaoDien ?? TUY_CHON_CA_NHAN_MAC_DINH.cheDoGiaoDien,
        thuGonThanhBenMacDinh:
          daLuu.thuGonThanhBenMacDinh ?? TUY_CHON_CA_NHAN_MAC_DINH.thuGonThanhBenMacDinh,
        anThongTinLienHeVoiLop:
          daLuu.anThongTinLienHeVoiLop ?? TUY_CHON_CA_NHAN_MAC_DINH.anThongTinLienHeVoiLop,
        thongBao: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.thongBao,
          ...(daLuu.thongBao || {}),
        },
        troLyAi: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.troLyAi,
          ...(daLuu.troLyAi || {}),
        },
        phongHoc: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.phongHoc,
          ...(daLuu.phongHoc || {}),
        },
      };
    } catch {
      return TUY_CHON_CA_NHAN_MAC_DINH;
    }
  }

  /**
   * Cập nhật tùy chọn cá nhân của người dùng
   */
  async capNhatTuyChonCaNhan(
    idNguoiDung: string,
    duLieuMoi: Partial<TuyChonCaNhan>,
  ): Promise<TuyChonCaNhan> {
    const hienTai = await this.layTuyChonCaNhan(idNguoiDung);
    const hopNhat: TuyChonCaNhan = {
      cheDoGiaoDien: duLieuMoi.cheDoGiaoDien ?? hienTai.cheDoGiaoDien,
      thuGonThanhBenMacDinh:
        duLieuMoi.thuGonThanhBenMacDinh ?? hienTai.thuGonThanhBenMacDinh,
      anThongTinLienHeVoiLop:
        duLieuMoi.anThongTinLienHeVoiLop ?? hienTai.anThongTinLienHeVoiLop,
      thongBao: {
        ...hienTai.thongBao,
        ...(duLieuMoi.thongBao || {}),
      },
      troLyAi: {
        ...hienTai.troLyAi,
        ...(duLieuMoi.troLyAi || {}),
      },
      phongHoc: {
        ...hienTai.phongHoc,
        ...(duLieuMoi.phongHoc || {}),
      },
    };

    const khoa = `ca_nhan.tuy_chon.${idNguoiDung}`;
    await this.khoCaiDat.capNhat(khoa, JSON.stringify(hopNhat));
    return hopNhat;
  }

  /**
   * Tải lên tệp hình ảnh thương hiệu (Logo, Favicon, Icon) an toàn
   * Tuân thủ Quy tắc 02 (Kiểm tra magic bytes, kích thước <= 5MB, chống XSS trong SVG, chống path traversal)
   */
  async taiLenTepThuongHieu(tep?: Express.Multer.File, khoa?: string) {
    if (!tep || !tep.buffer) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng chọn tập tin hình ảnh để tải lên',
      });
    }

    const mimeHopLe = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];

    if (
      !mimeHopLe.includes(tep.mimetype) &&
      !tep.originalname.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i)
    ) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep:
          'Định dạng tệp không hợp lệ. Chỉ chấp nhận PNG, JPG, WEBP, GIF, SVG hoặc ICO',
      });
    }

    const buf = tep.buffer;
    const laJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const laPng =
      buf.length >= 4 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47;
    const laGif =
      buf.length >= 4 &&
      buf[0] === 0x47 &&
      buf[1] === 0x49 &&
      buf[2] === 0x46 &&
      buf[3] === 0x38;
    const laWebp =
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP';
    const laIco =
      buf.length >= 4 &&
      buf[0] === 0x00 &&
      buf[1] === 0x00 &&
      buf[2] === 0x01 &&
      buf[3] === 0x00;

    // Kiểm tra định dạng SVG an toàn (chống Stored XSS)
    let laSvg = false;
    if (
      tep.mimetype === 'image/svg+xml' ||
      tep.originalname.toLowerCase().endsWith('.svg')
    ) {
      const noiDungChuoi = buf.toString('utf8');
      const chuaTheSvg = noiDungChuoi.toLowerCase().includes('<svg');
      const chuaMaDoc =
        /<script/i.test(noiDungChuoi) ||
        /javascript:/i.test(noiDungChuoi) ||
        /xlink:href\s*=\s*['"]javascript:/i.test(noiDungChuoi) ||
        /on\w+\s*=/i.test(noiDungChuoi);

      if (chuaTheSvg && !chuaMaDoc) {
        laSvg = true;
      }
    }

    if (!laJpeg && !laPng && !laGif && !laWebp && !laIco && !laSvg) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep:
          'Nội dung tập tin không đúng định dạng hình ảnh hợp lệ hoặc chứa mã độc nguy hiểm',
      });
    }

    let duoiTep = 'png';
    if (laJpeg) duoiTep = 'jpg';
    else if (laWebp) duoiTep = 'webp';
    else if (laGif) duoiTep = 'gif';
    else if (laIco) duoiTep = 'ico';
    else if (laSvg) duoiTep = 'svg';

    const tenTep = `${randomUUID()}.${duoiTep}`;
    const thuMucLuu = path.join(process.cwd(), 'uploads', 'thuong-hieu');
    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    const duongDanDayDu = path.join(thuMucLuu, tenTep);
    await fs.promises.writeFile(duongDanDayDu, buf);

    const url = `/uploads/thuong-hieu/${tenTep}`;

    // Tự động đồng bộ vào cấu hình hệ thống nếu có khóa hợp lệ (cả khóa mới và khóa cũ)
    const cacKhoaHopLe = [
      'URL_LOGO',
      'URL_FAVICON',
      'URL_ICON',
      'chung.url_logo',
      'chung.url_favicon',
      'chung.url_bieu_tuong_thu_gon',
    ];
    if (khoa && cacKhoaHopLe.includes(khoa)) {
      await this.khoCaiDat.capNhat(khoa, url);
    }

    return {
      thanhCong: true,
      thongDiep: 'Tải lên hình ảnh thành công',
      url,
      khoa: khoa || null,
      tenTepGoc: tep.originalname,
      kichThuoc: tep.size,
    };
  }
}
