import { Injectable } from '@nestjs/common';
import {
  PayloadJwt,
  VaiTro,
  TienIchBangDieuKhien,
  BuoiHocHomNay,
  TomTatLopHocPhan,
  CanhBaoSinhVien,
  HangChoXuLyGiangVien,
} from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

const TRANG_THAI_DA_NOP = ['DA_NOP', 'NOP_MUON', 'DA_CHAM', 'DA_TRA'];
const TRANG_THAI_CHO_CHAM = ['DA_NOP', 'NOP_MUON'];
const THU_TU_MUC_DO: Record<CanhBaoSinhVien['mucDo'], number> = { CAO: 0, VUA: 1, THAP: 2 };

@Injectable()
export class TienIchGiaoVienProvider implements NhaCungCapTienIch {
  readonly id = 'giang-day-giao-vien';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.GIAO_VIEN;
  }

  async cungCapTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // Tìm hồ sơ giảng viên. Mọi truy vấn bên dưới chỉ lấy dữ liệu các lớp giảng viên phụ trách.
    const hoSoGiaoVien = await this.prisma.hoSoGiaoVien.findUnique({
      where: { idNguoiDung: nguoiDung.id },
      include: {
        cacLopGiangDay: {
          select: {
            id: true,
            maLopHocPhan: true,
            tenLopHocPhan: true,
            _count: { select: { danhSachGhiDanh: true } },
          },
          orderBy: { maLopHocPhan: 'asc' },
        },
      },
    });

    if (!hoSoGiaoVien) {
      return [];
    }

    const cacLop = hoSoGiaoVien.cacLopGiangDay;
    const danhSachIdLop = cacLop.map((l) => l.id);
    const lopTheoId = new Map(cacLop.map((l) => [l.id, l]));
    const bayGio = new Date();

    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date();
    cuoiNgay.setHours(23, 59, 59, 999);

    const [cacBuoiHomNay, cacBaiTap, banGhiDiemDanh, cacGhiDanh, cacDonXinNghi, cacBanNhap] =
      await Promise.all([
        this.prisma.buoiHoc.findMany({
          where: { idLopHocPhan: { in: danhSachIdLop }, thoiGianBD: { gte: dauNgay, lte: cuoiNgay } },
          orderBy: { thoiGianBD: 'asc' },
          select: {
            id: true,
            idLopHocPhan: true,
            chuDe: true,
            thoiGianBD: true,
            thoiGianKT: true,
            trangThai: true,
            maDiemDanh: true,
            hanMaDiemDanh: true,
            banGhiDiemDanh: { select: { trangThai: true } },
          },
        }),
        this.prisma.baiTap.findMany({
          where: { idLopHocPhan: { in: danhSachIdLop } },
          orderBy: { hanNop: 'asc' },
          select: {
            id: true,
            idLopHocPhan: true,
            tieuDe: true,
            hanNop: true,
            diemToiDa: true,
            cacBaiNop: { select: { idNguoiDung: true, trangThai: true, diemSo: true } },
          },
        }),
        this.prisma.banGhiDiemDanh.findMany({
          where: { buoiHoc: { idLopHocPhan: { in: danhSachIdLop } } },
          select: { idHocSinh: true, trangThai: true, buoiHoc: { select: { idLopHocPhan: true } } },
        }),
        this.prisma.ghiDanh.findMany({
          where: { idLopHocPhan: { in: danhSachIdLop } },
          select: {
            idLopHocPhan: true,
            hocSinh: { select: { id: true, nguoiDung: { select: { id: true, hoTen: true } } } },
          },
        }),
        this.prisma.donXinNghi.findMany({
          where: { buoiHoc: { idLopHocPhan: { in: danhSachIdLop } }, trangThai: 'CHO_DUYET' },
          orderBy: { ngayTao: 'asc' },
          take: 10,
          select: {
            id: true,
            lyDo: true,
            nguoiGui: { select: { hoTen: true } },
            buoiHoc: { select: { thoiGianBD: true, idLopHocPhan: true } },
          },
        }),
        this.prisma.banNhapAI.findMany({
          where: { idGiaoVien: hoSoGiaoVien.id, trangThai: 'CHO_DUYET' },
          orderBy: { ngayTao: 'desc' },
          take: 10,
          select: { id: true, tieuDe: true, loaiBanNhap: true, idLopHocPhan: true },
        }),
      ]);

    const laCoMat = (t: string) => t === 'CO_MAT' || t === 'DI_MUON';
    const maLop = (id: string) => lopTheoId.get(id)?.maLopHocPhan ?? '';

    // 1. Lịch dạy hôm nay
    const lichHomNay: BuoiHocHomNay[] = cacBuoiHomNay.map((b) => {
      const conHieuLuc = Boolean(b.maDiemDanh && b.hanMaDiemDanh && b.hanMaDiemDanh > bayGio);
      return {
        id: b.id,
        idLopHocPhan: b.idLopHocPhan,
        maLopHocPhan: maLop(b.idLopHocPhan),
        tenLopHocPhan: lopTheoId.get(b.idLopHocPhan)?.tenLopHocPhan ?? '',
        chuDe: b.chuDe,
        thoiGianBD: b.thoiGianBD.toISOString(),
        thoiGianKT: b.thoiGianKT.toISOString(),
        trangThai: b.trangThai,
        siSo: lopTheoId.get(b.idLopHocPhan)?._count.danhSachGhiDanh ?? 0,
        soCoMat: b.banGhiDiemDanh.filter((bg) => laCoMat(bg.trangThai)).length,
        maDiemDanh: conHieuLuc ? b.maDiemDanh : null,
        hanMaDiemDanh: conHieuLuc ? b.hanMaDiemDanh!.toISOString() : null,
      };
    });

    // 2. Hàng chờ xử lý
    const hangCho: HangChoXuLyGiangVien = {
      chamBai: cacBaiTap
        .map((bt) => ({
          idBaiTap: bt.id,
          idLopHocPhan: bt.idLopHocPhan,
          maLopHocPhan: maLop(bt.idLopHocPhan),
          tieuDe: bt.tieuDe,
          soChoCham: bt.cacBaiNop.filter((bn) => TRANG_THAI_CHO_CHAM.includes(bn.trangThai)).length,
          hanNop: bt.hanNop.toISOString(),
        }))
        .filter((m) => m.soChoCham > 0),
      donXinNghi: cacDonXinNghi.map((d) => ({
        id: d.id,
        idLopHocPhan: d.buoiHoc.idLopHocPhan,
        maLopHocPhan: maLop(d.buoiHoc.idLopHocPhan),
        hoTen: d.nguoiGui.hoTen,
        lyDo: d.lyDo,
        ngayBuoiHoc: d.buoiHoc.thoiGianBD.toISOString(),
      })),
      banNhap: cacBanNhap.map((bn) => ({
        id: bn.id,
        idLopHocPhan: bn.idLopHocPhan,
        maLopHocPhan: maLop(bn.idLopHocPhan),
        tieuDe: bn.tieuDe,
        loaiBanNhap: bn.loaiBanNhap,
      })),
    };

    const soBaiNopChoCham = hangCho.chamBai.reduce((tong, m) => tong + m.soChoCham, 0);
    const soDonXinNghiChoDuyet = await this.prisma.donXinNghi.count({
      where: { buoiHoc: { idLopHocPhan: { in: danhSachIdLop } }, trangThai: 'CHO_DUYET' },
    });
    const soBanNhapAIChoDuyet = await this.prisma.banNhapAI.count({
      where: { idGiaoVien: hoSoGiaoVien.id, trangThai: 'CHO_DUYET' },
    });

    // 3. Tóm tắt lớp đang giảng dạy
    const tomTatLop: TomTatLopHocPhan[] = cacLop.map((lop) => {
      const siSo = lop._count.danhSachGhiDanh;
      const banGhiLop = banGhiDiemDanh.filter((bg) => bg.buoiHoc.idLopHocPhan === lop.id);
      const baiTapLop = cacBaiTap.filter((bt) => bt.idLopHocPhan === lop.id);
      const soBaiDaNop = baiTapLop.reduce(
        (tong, bt) => tong + bt.cacBaiNop.filter((bn) => TRANG_THAI_DA_NOP.includes(bn.trangThai)).length,
        0,
      );
      const soBaiCanNop = siSo * baiTapLop.length;
      return {
        id: lop.id,
        maLopHocPhan: lop.maLopHocPhan,
        tenLopHocPhan: lop.tenLopHocPhan,
        siSo,
        tyLeChuyenCan:
          banGhiLop.length > 0
            ? Math.round((banGhiLop.filter((bg) => laCoMat(bg.trangThai)).length / banGhiLop.length) * 100)
            : null,
        tyLeNopBai: soBaiCanNop > 0 ? Math.round((soBaiDaNop / soBaiCanNop) * 100) : null,
      };
    });

    // 4. Cảnh báo sớm: mỗi sinh viên trong mỗi lớp lấy mức cảnh báo nặng nhất
    const canhBao: CanhBaoSinhVien[] = [];
    for (const gd of cacGhiDanh) {
      const idHocSinh = gd.hocSinh.id;
      const idNguoiDungSv = gd.hocSinh.nguoiDung.id;
      const banGhiSv = banGhiDiemDanh.filter(
        (bg) => bg.idHocSinh === idHocSinh && bg.buoiHoc.idLopHocPhan === gd.idLopHocPhan,
      );
      const soVangKhongPhep = banGhiSv.filter((bg) => bg.trangThai === 'VANG_KHONG_PHEP').length;
      const soVang = banGhiSv.filter((bg) => bg.trangThai.startsWith('VANG')).length;

      const baiTapQuaHan = cacBaiTap.filter((bt) => bt.idLopHocPhan === gd.idLopHocPhan && bt.hanNop < bayGio);
      const soChuaNop = baiTapQuaHan.filter(
        (bt) => !bt.cacBaiNop.some((bn) => bn.idNguoiDung === idNguoiDungSv && TRANG_THAI_DA_NOP.includes(bn.trangThai)),
      ).length;

      const diemDaCham = cacBaiTap
        .filter((bt) => bt.idLopHocPhan === gd.idLopHocPhan)
        .flatMap((bt) =>
          bt.cacBaiNop
            .filter((bn) => bn.idNguoiDung === idNguoiDungSv && bn.diemSo !== null)
            .map((bn) => ((bn.diemSo as number) / (bt.diemToiDa || 10)) * 10),
        );
      const diemTrungBinh =
        diemDaCham.length >= 2 ? diemDaCham.reduce((a, b) => a + b, 0) / diemDaCham.length : null;

      let mucDo: CanhBaoSinhVien['mucDo'] | null = null;
      let lyDo = '';
      if (soVangKhongPhep >= 3) {
        mucDo = 'CAO';
        lyDo = `Vắng không phép ${soVangKhongPhep} buổi`;
      } else if (soChuaNop >= 2) {
        mucDo = 'VUA';
        lyDo = `Chưa nộp ${soChuaNop} bài tập quá hạn`;
      } else if (soVang >= 2) {
        mucDo = 'VUA';
        lyDo = `Vắng ${soVang} buổi`;
      } else if (diemTrungBinh !== null && diemTrungBinh < 5) {
        mucDo = 'THAP';
        lyDo = `Điểm trung bình bài tập ${diemTrungBinh.toFixed(1)}`;
      }

      if (mucDo) {
        canhBao.push({
          idHocSinh,
          hoTen: gd.hocSinh.nguoiDung.hoTen,
          idLopHocPhan: gd.idLopHocPhan,
          maLopHocPhan: maLop(gd.idLopHocPhan),
          lyDo,
          mucDo,
        });
      }
    }
    canhBao.sort((a, b) => THU_TU_MUC_DO[a.mucDo] - THU_TU_MUC_DO[b.mucDo]);

    // Thẻ số liệu (giữ nguyên để tương thích các màn hình cũ)
    ketQua.push(
      {
        id: 'the-buoi-day-hom-nay',
        loai: 'THE_THONG_KE',
        tieuDe: 'Buổi dạy hôm nay',
        moTa: lichHomNay.length > 0 ? `${lichHomNay.length} ca dạy theo lịch` : 'Hôm nay không có lịch giảng dạy',
        duongDanChiTiet: '/thoi-khoa-bieu',
        trangThai: 'THANH_CONG',
        duLieu: {
          id: 'the-buoi-day-hom-nay',
          tieuDe: 'Buổi dạy hôm nay',
          giaTri: lichHomNay.length,
          donVi: 'buổi',
          moTa: 'Lịch giảng dạy hôm nay',
          bieuTuong: 'Video',
          duongDanChiTiet: '/thoi-khoa-bieu',
        },
      },
      {
        id: 'the-bai-nop-cho-cham',
        loai: 'THE_THONG_KE',
        tieuDe: 'Bài nộp chờ chấm',
        moTa: soBaiNopChoCham > 0 ? `${soBaiNopChoCham} bài nộp của sinh viên` : 'Đã chấm hết bài tập',
        duongDanChiTiet: '/lop-hoc-phan',
        trangThai: 'THANH_CONG',
        duLieu: {
          id: 'the-bai-nop-cho-cham',
          tieuDe: 'Bài nộp chờ chấm',
          giaTri: soBaiNopChoCham,
          donVi: 'bài',
          moTa: soBaiNopChoCham > 0 ? 'Cần chấm điểm và nhận xét' : 'Hoàn thành tiến độ chấm',
          bieuTuong: 'GraduationCap',
          duongDanChiTiet: '/lop-hoc-phan',
        },
      },
      {
        id: 'the-don-xin-nghi-cho-duyet',
        loai: 'THE_THONG_KE',
        tieuDe: 'Đơn xin nghỉ chờ duyệt',
        moTa: soDonXinNghiChoDuyet > 0 ? `${soDonXinNghiChoDuyet} đơn cần xem xét` : 'Không có đơn nghỉ chờ duyệt',
        duongDanChiTiet: '/lop-hoc-phan',
        trangThai: 'THANH_CONG',
        duLieu: {
          id: 'the-don-xin-nghi-cho-duyet',
          tieuDe: 'Đơn xin nghỉ chờ duyệt',
          giaTri: soDonXinNghiChoDuyet,
          donVi: 'đơn',
          moTa: soDonXinNghiChoDuyet > 0 ? 'Sinh viên hoặc phụ huynh đã gửi' : 'Đã phản hồi toàn bộ',
          bieuTuong: 'Clock',
          duongDanChiTiet: '/lop-hoc-phan',
        },
      },
      {
        id: 'the-ban-nhap-ai-cho-duyet',
        loai: 'THE_THONG_KE',
        tieuDe: 'Bản nháp chờ duyệt',
        moTa: soBanNhapAIChoDuyet > 0 ? `${soBanNhapAIChoDuyet} nội dung do trợ lý tạo` : 'Không có bản nháp chờ duyệt',
        duongDanChiTiet: '/tro-ly-ai',
        trangThai: 'THANH_CONG',
        duLieu: {
          id: 'the-ban-nhap-ai-cho-duyet',
          tieuDe: 'Bản nháp chờ duyệt',
          giaTri: soBanNhapAIChoDuyet,
          donVi: 'bản nháp',
          moTa: soBanNhapAIChoDuyet > 0 ? 'Kiểm tra trước khi giao cho lớp' : 'Đã duyệt toàn bộ',
          bieuTuong: 'Bot',
          duongDanChiTiet: '/tro-ly-ai',
        },
      },
    );

    ketQua.push(
      {
        id: 'lich-hom-nay',
        loai: 'LICH_HOM_NAY',
        tieuDe: 'Lịch dạy hôm nay',
        duongDanChiTiet: '/thoi-khoa-bieu',
        trangThai: 'THANH_CONG',
        duLieu: lichHomNay,
      },
      {
        id: 'hang-cho-xu-ly',
        loai: 'HANG_CHO_XU_LY',
        tieuDe: 'Hàng chờ xử lý',
        trangThai: 'THANH_CONG',
        duLieu: hangCho,
      },
      {
        id: 'tom-tat-lop',
        loai: 'TOM_TAT_LOP',
        tieuDe: 'Lớp đang giảng dạy',
        duongDanChiTiet: '/lop-hoc-phan',
        trangThai: 'THANH_CONG',
        duLieu: tomTatLop,
      },
      {
        id: 'canh-bao-som',
        loai: 'CANH_BAO_SOM',
        tieuDe: 'Sinh viên cần chú ý',
        trangThai: 'THANH_CONG',
        duLieu: canhBao.slice(0, 8),
      },
    );

    // Việc cần xử lý (giữ để tương thích)
    const danhSachViec = [];
    if (soBaiNopChoCham > 0) {
      danhSachViec.push({
        id: 'viec-cham-bai-nop',
        tieuDe: `Chấm ${soBaiNopChoCham} bài nộp của sinh viên`,
        moTa: 'Bài nộp đang chờ chấm điểm và nhận xét.',
        loai: 'CHAM_DIEM',
        mucDoUuTien: 'CAO',
        duongDan: '/lop-hoc-phan',
      });
    }
    if (soDonXinNghiChoDuyet > 0) {
      danhSachViec.push({
        id: 'viec-duyet-don-nghi',
        tieuDe: `Duyệt ${soDonXinNghiChoDuyet} đơn xin nghỉ`,
        moTa: 'Sinh viên có đơn xin nghỉ buổi học cần giảng viên xác nhận.',
        loai: 'DUYET_DON',
        mucDoUuTien: 'CAO',
        duongDan: '/lop-hoc-phan',
      });
    }
    if (soBanNhapAIChoDuyet > 0) {
      danhSachViec.push({
        id: 'viec-duyet-ban-nhap-ai',
        tieuDe: `Duyệt ${soBanNhapAIChoDuyet} bản nháp do trợ lý tạo`,
        moTa: 'Câu hỏi kiểm tra và nhận xét cần kiểm duyệt trước khi giao.',
        loai: 'DUYET_AI',
        mucDoUuTien: 'TRUNG_BINH',
        duongDan: '/tro-ly-ai',
      });
    }
    if (danhSachViec.length === 0) {
      danhSachViec.push({
        id: 'viec-chuan-bi-bai-giang',
        tieuDe: 'Chuẩn bị bài giảng và tài liệu tuần tới',
        moTa: 'Tất cả bài nộp và đơn từ đã hoàn tất xử lý.',
        loai: 'KHAC',
        mucDoUuTien: 'THAP',
        duongDan: '/lop-hoc-phan',
      });
    }

    ketQua.push({
      id: 'viec-can-xu-ly-giao-vien',
      loai: 'VIEC_CAN_XU_LY',
      tieuDe: 'Việc cần xử lý',
      trangThai: 'THANH_CONG',
      duLieu: danhSachViec,
    });

    return ketQua;
  }
}
