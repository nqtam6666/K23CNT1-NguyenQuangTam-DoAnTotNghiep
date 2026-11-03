import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { KhoTaiLieuRepository } from './kho-tai-lieu.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  PayloadJwt,
  VaiTro,
  LoaiTaiLieu,
  TaoTaiLieuInput,
  DanhGiaTaiLieuInput,
  DanhGiaTaiLieu,
  CapNhatPhienBanTaiLieuInput,
  KhoiPhucPhienBanTaiLieuInput,
  PhienBanTaiLieu,
  MaLoiNghiepVu,
} from '@lms/chung';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class DichVuTaiLieuService {
  private readonly boNhoDanhGia = new Map<string, Map<string, DanhGiaTaiLieu>>();
  private readonly boNhoPhienBan = new Map<string, PhienBanTaiLieu[]>();

  constructor(
    private readonly khoTaiLieu: KhoTaiLieuRepository,
    private readonly prisma: PrismaService,
    @Optional() private readonly dichVuCaiDat?: DichVuCaiDatService,
  ) {}

  async kiemTraQuyenTruyCapLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy lớp học phần',
      });
    }

    if (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    ) {
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo || lop.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn không phụ trách giảng dạy lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Không tìm thấy hồ sơ học sinh',
        });
      }
      const ghiDanh = await this.prisma.ghiDanh.findFirst({
        where: { idLopHocPhan, idHocSinh: hoSo.id },
      });
      if (!ghiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn chưa được ghi danh vào lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: nguoiDung.sub },
        select: { idHocSinh: true },
      });
      const coConHoc = await this.prisma.ghiDanh.findFirst({
        where: {
          idLopHocPhan,
          idHocSinh: { in: lienKet.map((l) => l.idHocSinh) },
        },
      });
      if (!coConHoc) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Con em của bạn không học lớp này',
        });
      }
      return lop;
    }

    throw new ForbiddenException({
      thanhCong: false,
      maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
      thongDiep: 'Không có quyền truy cập',
    });
  }

  private async kiemTraQuyenQuanLyTaiLieu(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const lop = await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);
    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && lop.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giáo viên giảng dạy lớp hoặc quản trị viên mới có quyền quản lý phiên bản tài liệu',
      });
    }

    return lop;
  }

  private async kiemTraVaLuuTepTaiLieu(tep: Express.Multer.File | undefined) {
    if (!tep) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng đính kèm tập tin tài liệu',
      });
    }

    const dungLuongToiDaMb =
      (await this.dichVuCaiDat?.layGiaTriSo('bai_tap.dung_luong_tai_lieu_toi_da_mb', 25)) ?? 25;
    if (tep.size > dungLuongToiDaMb * 1024 * 1024) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Kích thước tệp tài liệu vượt quá giới hạn cho phép (${dungLuongToiDaMb}MB).`,
      });
    }

    const chuoiDinhDang =
      (await this.dichVuCaiDat?.layGiaTriChuoi(
        'bai_tap.dinh_dang_tep_cho_phep',
        'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,png,jpg,jpeg',
      )) || 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,png,jpg,jpeg';

    const duoiHopLe = chuoiDinhDang
      .split(',')
      .map((d) => d.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean);

    const phanMoRong = path.extname(tep.originalname).toLowerCase().replace('.', '');

    if (!duoiHopLe.includes(phanMoRong)) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Định dạng tệp .${phanMoRong} không được hỗ trợ. Chỉ chấp nhận: ${duoiHopLe.join(', ')}`,
      });
    }

    const tenTepMoi = `${randomUUID()}.${phanMoRong}`;
    const thuMucLuu = path.join(process.cwd(), 'uploads', 'tai-lieu');
    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    const duongDanDayDu = path.join(thuMucLuu, tenTepMoi);
    await fs.promises.writeFile(duongDanDayDu, tep.buffer);

    return `/uploads/tai-lieu/${tenTepMoi}`;
  }

  private async dongBoMetadataTaiLieu(danhSachIdTaiLieu: string[]) {
    if (danhSachIdTaiLieu.length === 0) return;

    if ((this.prisma as any).nhatKyHeThong?.findMany) {
      const cacBanGhi = await (this.prisma as any).nhatKyHeThong.findMany({
        where: {
          thucThe: 'TaiLieu',
          idThucThe: { in: danhSachIdTaiLieu },
          hanhDong: {
            in: [
              'DANH_GIA_TAI_LIEU',
              'TAO_PHIEN_BAN_TAI_LIEU',
              'CAP_NHAT_PHIEN_BAN_TAI_LIEU',
            ],
          },
        },
        orderBy: { ngayTao: 'asc' },
      });

      for (const bg of cacBanGhi) {
        const idTaiLieu = bg.idThucThe;
        const chiTiet = bg.chiTiet as Record<string, any> | null;
        if (!idTaiLieu || !chiTiet) continue;

        if (bg.hanhDong === 'DANH_GIA_TAI_LIEU' && chiTiet.idNguoiDung) {
          const mapTl = this.boNhoDanhGia.get(idTaiLieu) || new Map<string, DanhGiaTaiLieu>();
          mapTl.set(chiTiet.idNguoiDung, {
            id: bg.id || `${idTaiLieu}:${chiTiet.idNguoiDung}`,
            idTaiLieu,
            idNguoiDung: chiTiet.idNguoiDung,
            hoTenNguoiDung: chiTiet.hoTenNguoiDung || 'Thành viên lớp',
            vaiTroNguoiDung: chiTiet.vaiTroNguoiDung,
            soSao: Number(chiTiet.soSao) || 5,
            nhanXet: chiTiet.nhanXet ?? null,
            ngayTao: chiTiet.ngayTao || bg.ngayTao,
          });
          this.boNhoDanhGia.set(idTaiLieu, mapTl);
        } else if (
          (bg.hanhDong === 'TAO_PHIEN_BAN_TAI_LIEU' ||
            bg.hanhDong === 'CAP_NHAT_PHIEN_BAN_TAI_LIEU') &&
          chiTiet.soPhienBan
        ) {
          const dsPhienBan = this.boNhoPhienBan.get(idTaiLieu) || [];
          const daTonTai = dsPhienBan.some(
            (pb) => pb.soPhienBan === Number(chiTiet.soPhienBan),
          );
          if (!daTonTai) {
            dsPhienBan.push({
              id: bg.id || `${idTaiLieu}:v${chiTiet.soPhienBan}`,
              idTaiLieu,
              soPhienBan: Number(chiTiet.soPhienBan),
              tieuDe: chiTiet.tieuDe || 'Tài liệu môn học',
              duongDanTep: chiTiet.duongDanTep,
              kichThuocTep: Number(chiTiet.kichThuocTep) || 0,
              ghiChuThayDoi: chiTiet.ghiChuThayDoi || 'Khởi tạo tài liệu',
              hoTenNguoiCapNhat: chiTiet.hoTenNguoiCapNhat || 'Giảng viên',
              ngayTao: chiTiet.ngayTao || bg.ngayTao,
            });
            this.boNhoPhienBan.set(idTaiLieu, dsPhienBan);
          }
        }
      }
    }
  }

  async layDanhSachTaiLieu(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);
    const danhSach = await this.khoTaiLieu.layDanhSachTheoLop(idLopHocPhan);
    if (!danhSach || danhSach.length === 0) return [];

    const danhSachId = danhSach.map((tl: any) => tl.id);
    await this.dongBoMetadataTaiLieu(danhSachId);

    return danhSach.map((tl: any) => {
      const mapDanhGia = this.boNhoDanhGia.get(tl.id);
      const cacDanhGia = mapDanhGia ? Array.from(mapDanhGia.values()) : [];
      const tongSoDanhGia = cacDanhGia.length;
      const diemDanhGiaTrungBinh =
        tongSoDanhGia > 0
          ? Number(
              (
                cacDanhGia.reduce((tong, dg) => tong + dg.soSao, 0) / tongSoDanhGia
              ).toFixed(1),
            )
          : 0;
      const danhGiaCuaToi = mapDanhGia?.get(nguoiDung.sub) || null;

      const dsPhienBan = this.boNhoPhienBan.get(tl.id) || [];
      const phienBanMoiNhat =
        dsPhienBan.length > 0
          ? [...dsPhienBan].sort((a, b) => b.soPhienBan - a.soPhienBan)[0]
          : null;

      return {
        ...tl,
        soPhienBanHienTai: phienBanMoiNhat ? phienBanMoiNhat.soPhienBan : 1,
        ghiChuPhienBanMoiNhat: phienBanMoiNhat ? phienBanMoiNhat.ghiChuThayDoi : null,
        ngayCapNhatPhienBan: phienBanMoiNhat ? phienBanMoiNhat.ngayTao : tl.ngayTao,
        diemDanhGiaTrungBinh,
        tongSoDanhGia,
        danhGiaCuaToi: danhGiaCuaToi
          ? {
              soSao: danhGiaCuaToi.soSao,
              nhanXet: danhGiaCuaToi.nhanXet ?? null,
              ngayTao: danhGiaCuaToi.ngayTao,
            }
          : null,
        soDoanVectorRag: tl._count?.cacDoanRAG ?? 0,
      };
    });
  }

  async taiLenTaiLieu(
    idLopHocPhan: string,
    duLieu: TaoTaiLieuInput,
    tep: Express.Multer.File | undefined,
    nguoiDung: PayloadJwt,
  ) {
    await this.kiemTraQuyenQuanLyTaiLieu(idLopHocPhan, nguoiDung);
    const duongDanTep = await this.kiemTraVaLuuTepTaiLieu(tep);

    const taiLieuMoi = await this.khoTaiLieu.taoTaiLieu({
      idLopHocPhan,
      tieuDe: duLieu.tieuDe.trim(),
      moTa: duLieu.moTa ? duLieu.moTa.trim() : null,
      duongDanTep,
      loaiTaiLieu: duLieu.loaiTaiLieu || LoaiTaiLieu.TAI_LIEU_THAM_KHAO,
      kichThuocTep: tep!.size,
    });

    const phienBanDauTien: PhienBanTaiLieu = {
      id: `${taiLieuMoi.id}:v1`,
      idTaiLieu: taiLieuMoi.id,
      soPhienBan: 1,
      tieuDe: taiLieuMoi.tieuDe,
      duongDanTep: taiLieuMoi.duongDanTep,
      kichThuocTep: taiLieuMoi.kichThuocTep,
      ghiChuThayDoi: 'Phiên bản khởi tạo lần đầu',
      hoTenNguoiCapNhat: nguoiDung.hoTen || 'Giảng viên',
      ngayTao: taiLieuMoi.ngayTao,
      laPhienBanHienTai: true,
    };
    this.boNhoPhienBan.set(taiLieuMoi.id, [phienBanDauTien]);

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'TAO_PHIEN_BAN_TAI_LIEU',
          thucThe: 'TaiLieu',
          idThucThe: taiLieuMoi.id,
          chiTiet: phienBanDauTien as any,
        },
      });
    }

    return {
      ...taiLieuMoi,
      soPhienBanHienTai: 1,
      ghiChuPhienBanMoiNhat: phienBanDauTien.ghiChuThayDoi,
      diemDanhGiaTrungBinh: 0,
      tongSoDanhGia: 0,
    };
  }

  // ==========================================
  // NHÓM 5: ĐÁNH GIÁ HỌC LIỆU (1-5 SAO & NHẬN XÉT)
  // ==========================================

  async danhGiaTaiLieu(
    idTaiLieu: string,
    duLieu: DanhGiaTaiLieuInput,
    nguoiDung: PayloadJwt,
  ) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
      });
    }

    await this.kiemTraQuyenTruyCapLop(taiLieu.idLopHocPhan, nguoiDung);
    await this.dongBoMetadataTaiLieu([idTaiLieu]);

    const banGhiDanhGia: DanhGiaTaiLieu = {
      id: randomUUID(),
      idTaiLieu,
      idNguoiDung: nguoiDung.sub,
      hoTenNguoiDung: nguoiDung.hoTen || nguoiDung.email,
      vaiTroNguoiDung: nguoiDung.vaiTro,
      soSao: duLieu.soSao,
      nhanXet: duLieu.nhanXet?.trim() || null,
      ngayTao: new Date().toISOString(),
    };

    const mapTl = this.boNhoDanhGia.get(idTaiLieu) || new Map<string, DanhGiaTaiLieu>();
    mapTl.set(nguoiDung.sub, banGhiDanhGia);
    this.boNhoDanhGia.set(idTaiLieu, mapTl);

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'DANH_GIA_TAI_LIEU',
          thucThe: 'TaiLieu',
          idThucThe: idTaiLieu,
          chiTiet: banGhiDanhGia as any,
        },
      });
    }

    const danhSachDanhGia = Array.from(mapTl.values());
    const tongSoDanhGia = danhSachDanhGia.length;
    const diemDanhGiaTrungBinh = Number(
      (
        danhSachDanhGia.reduce((tong, dg) => tong + dg.soSao, 0) / tongSoDanhGia
      ).toFixed(1),
    );

    return {
      idTaiLieu,
      diemDanhGiaTrungBinh,
      tongSoDanhGia,
      danhGiaCuaToi: banGhiDanhGia,
    };
  }

  async layDanhSachDanhGia(idTaiLieu: string, nguoiDung: PayloadJwt) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
      });
    }

    await this.kiemTraQuyenTruyCapLop(taiLieu.idLopHocPhan, nguoiDung);
    await this.dongBoMetadataTaiLieu([idTaiLieu]);

    const mapTl = this.boNhoDanhGia.get(idTaiLieu);
    const danhSachDanhGia = mapTl
      ? Array.from(mapTl.values()).sort(
          (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime(),
        )
      : [];
    const tongSoDanhGia = danhSachDanhGia.length;
    const diemDanhGiaTrungBinh =
      tongSoDanhGia > 0
        ? Number(
            (
              danhSachDanhGia.reduce((tong, dg) => tong + dg.soSao, 0) /
              tongSoDanhGia
            ).toFixed(1),
          )
        : 0;

    return {
      idTaiLieu,
      diemDanhGiaTrungBinh,
      tongSoDanhGia,
      danhSachDanhGia,
    };
  }

  // ==========================================
  // NHÓM 6: QUẢN LÝ PHIÊN BẢN HỌC LIỆU (VERSIONING)
  // ==========================================

  private async damBaoPhienBanGoc(taiLieu: any): Promise<PhienBanTaiLieu[]> {
    await this.dongBoMetadataTaiLieu([taiLieu.id]);
    let ds = this.boNhoPhienBan.get(taiLieu.id) || [];
    if (ds.length === 0) {
      const v1: PhienBanTaiLieu = {
        id: `${taiLieu.id}:v1`,
        idTaiLieu: taiLieu.id,
        soPhienBan: 1,
        tieuDe: taiLieu.tieuDe,
        duongDanTep: taiLieu.duongDanTep,
        kichThuocTep: taiLieu.kichThuocTep,
        ghiChuThayDoi: 'Phiên bản gốc ban đầu',
        hoTenNguoiCapNhat: 'Giảng viên phụ trách',
        ngayTao: taiLieu.ngayTao,
      };
      ds = [v1];
      this.boNhoPhienBan.set(taiLieu.id, ds);
    }
    return ds;
  }

  async capNhatPhienBanTaiLieu(
    idTaiLieu: string,
    duLieu: CapNhatPhienBanTaiLieuInput,
    tep: Express.Multer.File | undefined,
    nguoiDung: PayloadJwt,
  ) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập cần cập nhật phiên bản',
      });
    }

    await this.kiemTraQuyenQuanLyTaiLieu(taiLieu.idLopHocPhan, nguoiDung);
    const dsPhienBan = await this.damBaoPhienBanGoc(taiLieu);
    const duongDanTepMoi = await this.kiemTraVaLuuTepTaiLieu(tep);

    const soPhienBanTiepTheo =
      Math.max(...dsPhienBan.map((pb) => pb.soPhienBan), 1) + 1;
    const tieuDeMoi = duLieu.tieuDe?.trim() || taiLieu.tieuDe;
    const moTaMoi =
      duLieu.moTa !== undefined
        ? duLieu.moTa?.trim() || null
        : taiLieu.moTa;

    const taiLieuCapNhat = await this.khoTaiLieu.capNhatTaiLieu(idTaiLieu, {
      tieuDe: tieuDeMoi,
      moTa: moTaMoi,
      duongDanTep: duongDanTepMoi,
      kichThuocTep: tep!.size,
    });

    const banGhiPhienBanMoi: PhienBanTaiLieu = {
      id: randomUUID(),
      idTaiLieu,
      soPhienBan: soPhienBanTiepTheo,
      tieuDe: tieuDeMoi,
      duongDanTep: duongDanTepMoi,
      kichThuocTep: tep!.size,
      ghiChuThayDoi: duLieu.ghiChuThayDoi.trim(),
      hoTenNguoiCapNhat: nguoiDung.hoTen || nguoiDung.email,
      ngayTao: new Date().toISOString(),
      laPhienBanHienTai: true,
    };

    dsPhienBan.push(banGhiPhienBanMoi);
    this.boNhoPhienBan.set(idTaiLieu, dsPhienBan);

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'CAP_NHAT_PHIEN_BAN_TAI_LIEU',
          thucThe: 'TaiLieu',
          idThucThe: idTaiLieu,
          chiTiet: banGhiPhienBanMoi as any,
        },
      });
    }

    return {
      ...taiLieuCapNhat,
      soPhienBanHienTai: soPhienBanTiepTheo,
      ghiChuPhienBanMoiNhat: banGhiPhienBanMoi.ghiChuThayDoi,
      ngayCapNhatPhienBan: banGhiPhienBanMoi.ngayTao,
      phienBanMoi: banGhiPhienBanMoi,
    };
  }

  async layLichSuPhienBan(idTaiLieu: string, nguoiDung: PayloadJwt) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
      });
    }

    await this.kiemTraQuyenTruyCapLop(taiLieu.idLopHocPhan, nguoiDung);
    const dsPhienBan = await this.damBaoPhienBanGoc(taiLieu);

    const danhSachSapXep = [...dsPhienBan]
      .sort((a, b) => b.soPhienBan - a.soPhienBan)
      .map((pb) => ({
        ...pb,
        laPhienBanHienTai: pb.duongDanTep === taiLieu.duongDanTep,
      }));

    return {
      idTaiLieu,
      tieuDeHienTai: taiLieu.tieuDe,
      duongDanHienTai: taiLieu.duongDanTep,
      tongSoPhienBan: danhSachSapXep.length,
      danhSachPhienBan: danhSachSapXep,
    };
  }

  async khoiPhucPhienBan(
    idTaiLieu: string,
    duLieu: KhoiPhucPhienBanTaiLieuInput,
    nguoiDung: PayloadJwt,
  ) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
      });
    }

    await this.kiemTraQuyenQuanLyTaiLieu(taiLieu.idLopHocPhan, nguoiDung);
    const dsPhienBan = await this.damBaoPhienBanGoc(taiLieu);

    const phienBanDich = dsPhienBan.find(
      (pb) => pb.soPhienBan === duLieu.soPhienBan,
    );
    if (!phienBanDich) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Không tìm thấy phiên bản v${duLieu.soPhienBan} trong lịch sử tài liệu`,
      });
    }

    const taiLieuCapNhat = await this.khoTaiLieu.capNhatTaiLieu(idTaiLieu, {
      tieuDe: phienBanDich.tieuDe,
      duongDanTep: phienBanDich.duongDanTep,
      kichThuocTep: phienBanDich.kichThuocTep,
    });

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'KHOI_PHUC_PHIEN_BAN_TAI_LIEU',
          thucThe: 'TaiLieu',
          idThucThe: idTaiLieu,
          chiTiet: {
            soPhienBanKhoiPhuc: phienBanDich.soPhienBan,
            duongDanTep: phienBanDich.duongDanTep,
            nguoiThucHien: nguoiDung.hoTen || nguoiDung.email,
          },
        },
      });
    }

    return {
      ...taiLieuCapNhat,
      soPhienBanKhoiPhuc: phienBanDich.soPhienBan,
      thongDiep: `Đã khôi phục tài liệu về phiên bản v${phienBanDich.soPhienBan}`,
    };
  }

  async xoaTaiLieu(idTaiLieu: string, nguoiDung: PayloadJwt) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
      });
    }

    await this.kiemTraQuyenQuanLyTaiLieu(taiLieu.idLopHocPhan, nguoiDung);

    // Xóa file vật lý trên disk nếu tồn tại
    try {
      const duongDanTep = path.join(process.cwd(), taiLieu.duongDanTep.replace(/^\//, ''));
      if (fs.existsSync(duongDanTep)) {
        await fs.promises.unlink(duongDanTep);
      }
    } catch {
      // Bỏ qua lỗi xóa tệp vật lý để không làm gián đoạn CSDL
    }

    await this.khoTaiLieu.xoaTaiLieu(idTaiLieu);
    this.boNhoDanhGia.delete(idTaiLieu);
    this.boNhoPhienBan.delete(idTaiLieu);
    return { thanhCong: true, thongDiep: 'Đã xóa tài liệu học tập thành công' };
  }
}
