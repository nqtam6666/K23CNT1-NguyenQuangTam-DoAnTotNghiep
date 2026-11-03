import { Injectable } from '@nestjs/common';
import {
  PayloadJwt,
  VaiTro,
  TienIchBangDieuKhien,
  ViecCanXuLy,
  BuoiHocHomNay,
  TomTatLopHocPhan,
} from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchHocSinhProvider implements NhaCungCapTienIch {
  readonly id = 'hoc-tap-hoc-sinh';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.HOC_SINH;
  }

  async cungCapTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // Tìm hồ sơ sinh viên. Mọi truy vấn bên dưới chỉ lấy dữ liệu của các lớp sinh viên đã ghi danh.
    const hoSoHocSinh = await this.prisma.hoSoHocSinh.findUnique({
      where: { idNguoiDung: nguoiDung.id },
      include: {
        danhSachGhiDanh: { select: { idLopHocPhan: true } },
      },
    });

    if (!hoSoHocSinh) {
      return [];
    }

    const danhSachIdLop = hoSoHocSinh.danhSachGhiDanh.map((gd) => gd.idLopHocPhan);

    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date();
    cuoiNgay.setHours(23, 59, 59, 999);

    // 1. Lịch học hôm nay (danh sách buổi kèm trạng thái điểm danh của chính sinh viên)
    const cacBuoiHomNay = await this.prisma.buoiHoc.findMany({
      where: {
        idLopHocPhan: { in: danhSachIdLop },
        thoiGianBD: { gte: dauNgay, lte: cuoiNgay },
      },
      orderBy: { thoiGianBD: 'asc' },
      select: {
        id: true,
        idLopHocPhan: true,
        chuDe: true,
        thoiGianBD: true,
        thoiGianKT: true,
        trangThai: true,
        lopHocPhan: {
          select: {
            maLopHocPhan: true,
            tenLopHocPhan: true,
            giaoVien: { select: { nguoiDung: { select: { hoTen: true } } } },
          },
        },
        banGhiDiemDanh: {
          where: { idHocSinh: hoSoHocSinh.id },
          select: { trangThai: true },
        },
      },
    });

    const lichHomNay: BuoiHocHomNay[] = cacBuoiHomNay.map((b) => ({
      id: b.id,
      idLopHocPhan: b.idLopHocPhan,
      maLopHocPhan: b.lopHocPhan.maLopHocPhan,
      tenLopHocPhan: b.lopHocPhan.tenLopHocPhan,
      chuDe: b.chuDe,
      thoiGianBD: b.thoiGianBD.toISOString(),
      thoiGianKT: b.thoiGianKT.toISOString(),
      trangThai: b.trangThai,
      tenGiangVien: b.lopHocPhan.giaoVien?.nguoiDung?.hoTen,
      trangThaiDiemDanh: b.banGhiDiemDanh[0]?.trangThai ?? null,
    }));

    ketQua.push({
      id: 'the-lich-hoc-hom-nay',
      loai: 'THE_THONG_KE',
      tieuDe: 'Lịch học hôm nay',
      moTa: lichHomNay.length > 0 ? `${lichHomNay.length} buổi học theo thời khóa biểu` : 'Hôm nay không có buổi học',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-lich-hoc-hom-nay',
        tieuDe: 'Lịch học hôm nay',
        giaTri: lichHomNay.length,
        donVi: 'buổi',
        moTa: 'Theo dõi ca học và phòng trực tuyến',
        bieuTuong: 'Calendar',
        duongDanChiTiet: '/thoi-khoa-bieu',
      },
    });

    ketQua.push({
      id: 'lich-hom-nay',
      loai: 'LICH_HOM_NAY',
      tieuDe: 'Lịch học hôm nay',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: lichHomNay,
    });

    // 2. Bài tập sắp đến hạn (trong 7 ngày tới, chưa nộp)
    const bayNgayToi = new Date();
    bayNgayToi.setDate(bayNgayToi.getDate() + 7);

    const cacBaiTapSapHan = await this.prisma.baiTap.findMany({
      where: {
        idLopHocPhan: { in: danhSachIdLop },
        hanNop: { gte: new Date(), lte: bayNgayToi },
        cacBaiNop: {
          none: { idNguoiDung: nguoiDung.id, trangThai: { in: ['DA_NOP', 'DA_CHAM', 'NOP_MUON', 'DA_TRA'] } },
        },
      },
      orderBy: { hanNop: 'asc' },
      select: {
        id: true,
        tieuDe: true,
        hanNop: true,
        idLopHocPhan: true,
        lopHocPhan: { select: { maLopHocPhan: true } },
      },
    });

    ketQua.push({
      id: 'the-bai-tap-sap-den-han',
      loai: 'THE_THONG_KE',
      tieuDe: 'Bài tập sắp đến hạn',
      moTa: cacBaiTapSapHan.length > 0 ? `${cacBaiTapSapHan.length} bài tập cần hoàn thành trong tuần` : 'Đã nộp đủ bài tập',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-bai-tap-sap-den-han',
        tieuDe: 'Bài tập sắp đến hạn',
        giaTri: cacBaiTapSapHan.length,
        donVi: 'bài tập',
        moTa: cacBaiTapSapHan.length > 0 ? 'Hạn nộp trong 7 ngày tới' : 'Không có bài tập trễ hạn',
        bieuTuong: 'BookOpen',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 3. Chuyên cần tổng và theo từng lớp
    const banGhiDiemDanh = await this.prisma.banGhiDiemDanh.findMany({
      where: { idHocSinh: hoSoHocSinh.id },
      select: { trangThai: true, buoiHoc: { select: { idLopHocPhan: true } } },
    });

    const laCoMat = (t: string) => t === 'CO_MAT' || t === 'DI_MUON';
    const tongSoBuoi = banGhiDiemDanh.length;
    const soBuoiCoMat = banGhiDiemDanh.filter((bg) => laCoMat(bg.trangThai)).length;
    const tyLeChuyenCan = tongSoBuoi > 0 ? Math.round((soBuoiCoMat / tongSoBuoi) * 100) : 100;

    ketQua.push({
      id: 'the-chuyen-can-cua-toi',
      loai: 'THE_THONG_KE',
      tieuDe: 'Chuyên cần của tôi',
      moTa: `Có mặt ${soBuoiCoMat}/${tongSoBuoi} buổi học đã điểm danh`,
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-chuyen-can-cua-toi',
        tieuDe: 'Chuyên cần của tôi',
        giaTri: `${tyLeChuyenCan}%`,
        moTa: `Có mặt ${soBuoiCoMat}/${tongSoBuoi} buổi học`,
        bieuTuong: 'UserCheck',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 4. Tóm tắt các lớp học phần đã ghi danh
    const cacLop = await this.prisma.lopHocPhan.findMany({
      where: { id: { in: danhSachIdLop } },
      orderBy: { maLopHocPhan: 'asc' },
      select: {
        id: true,
        maLopHocPhan: true,
        tenLopHocPhan: true,
        giaoVien: { select: { nguoiDung: { select: { hoTen: true } } } },
        _count: { select: { danhSachGhiDanh: true } },
      },
    });

    const tomTatLop: TomTatLopHocPhan[] = cacLop.map((lop) => {
      const banGhiLop = banGhiDiemDanh.filter((bg) => bg.buoiHoc.idLopHocPhan === lop.id);
      return {
        id: lop.id,
        maLopHocPhan: lop.maLopHocPhan,
        tenLopHocPhan: lop.tenLopHocPhan,
        tenGiangVien: lop.giaoVien?.nguoiDung?.hoTen,
        siSo: lop._count.danhSachGhiDanh,
        soBuoiCoMat: banGhiLop.filter((bg) => laCoMat(bg.trangThai)).length,
        soBuoiDaDiemDanh: banGhiLop.length,
      };
    });

    ketQua.push({
      id: 'tom-tat-lop',
      loai: 'TOM_TAT_LOP',
      tieuDe: 'Lớp học phần của tôi',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: tomTatLop,
    });

    // 5. Việc cần xử lý
    const danhSachViec: ViecCanXuLy[] = cacBaiTapSapHan.map((bt) => ({
      id: `nop-bai-${bt.id}`,
      tieuDe: `Nộp bài tập: ${bt.tieuDe}`,
      moTa: bt.lopHocPhan.maLopHocPhan,
      loai: 'NOP_BAI' as const,
      mucDoUuTien: 'CAO' as const,
      thoiHan: bt.hanNop.toISOString(),
      duongDan: `/lop-hoc-phan/${bt.idLopHocPhan}`,
    }));

    if (danhSachViec.length === 0) {
      danhSachViec.push({
        id: 'viec-on-tap',
        tieuDe: 'Ôn tập kiến thức và xem trước tài liệu buổi học tới',
        moTa: 'Bạn đã hoàn tất tất cả bài tập được giao.',
        loai: 'KHAC' as const,
        mucDoUuTien: 'THAP' as const,
        duongDan: '/lop-hoc-phan',
      });
    }

    ketQua.push({
      id: 'viec-can-xu-ly-hoc-sinh',
      loai: 'VIEC_CAN_XU_LY',
      tieuDe: 'Việc cần xử lý',
      trangThai: 'THANH_CONG',
      duLieu: danhSachViec,
    });

    return ketQua;
  }
}
