import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien, ViecCanXuLy } from '@lms/chung';
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

    // Tìm hồ sơ học sinh
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

    // 1. Thẻ lịch học hôm nay
    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date();
    cuoiNgay.setHours(23, 59, 59, 999);

    const soBuoiHocHomNay = await this.prisma.buoiHoc.count({
      where: {
        idLopHocPhan: { in: danhSachIdLop },
        thoiGianBD: { gte: dauNgay, lte: cuoiNgay },
      },
    });

    ketQua.push({
      id: 'the-lich-hoc-hom-nay',
      loai: 'THE_THONG_KE',
      tieuDe: 'Lịch học hôm nay',
      moTa: soBuoiHocHomNay > 0 ? `${soBuoiHocHomNay} buổi học theo thời khóa biểu` : 'Hôm nay không có buổi học',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-lich-hoc-hom-nay',
        tieuDe: 'Lịch học hôm nay',
        giaTri: soBuoiHocHomNay,
        donVi: 'buổi',
        moTa: 'Theo dõi ca học và phòng trực tuyến',
        bieuTuong: 'Calendar',
        mauSac: 'xanh_duong',
        duongDanChiTiet: '/thoi-khoa-bieu',
      },
    });

    // 2. Thẻ bài tập sắp đến hạn (trong vòng 7 ngày tới)
    const bayNgayToi = new Date();
    bayNgayToi.setDate(bayNgayToi.getDate() + 7);

    // Lấy bài tập chưa nộp
    const cacBaiTapSapHan = await this.prisma.baiTap.findMany({
      where: {
        idLopHocPhan: { in: danhSachIdLop },
        hanNop: { gte: new Date(), lte: bayNgayToi },
        cacBaiNop: {
          none: { idNguoiDung: nguoiDung.id, trangThai: { in: ['DA_NOP', 'DA_CHAM'] } },
        },
      },
      select: { id: true, tieuDe: true, hanNop: true, idLopHocPhan: true },
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
        mauSac: cacBaiTapSapHan.length > 0 ? 'cam' : 'xanh_la',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 3. Thẻ chuyên cần của tôi
    const banGhiDiemDanh = await this.prisma.banGhiDiemDanh.findMany({
      where: { idHocSinh: hoSoHocSinh.id },
      select: { trangThai: true },
    });

    const tongSoBuoi = banGhiDiemDanh.length;
    const soBuoiCoMat = banGhiDiemDanh.filter((bg) => bg.trangThai === 'CO_MAT').length;
    const tyLeChuyenCan = tongSoBuoi > 0 ? Math.round((soBuoiCoMat / tongSoBuoi) * 100) : 100;

    ketQua.push({
      id: 'the-chuyen-can-cua-toi',
      loai: 'THE_THONG_KE',
      tieuDe: 'Chuyên cần của tôi',
      moTa: `Có mặt ${soBuoiCoMat}/${tongSoBuoi || 1} buổi học đã diễn ra`,
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-chuyen-can-cua-toi',
        tieuDe: 'Chuyên cần của tôi',
        giaTri: `${tyLeChuyenCan}%`,
        moTa: `Có mặt ${soBuoiCoMat}/${tongSoBuoi || 1} buổi học`,
        bieuTuong: 'UserCheck',
        mauSac: tyLeChuyenCan >= 80 ? 'xanh_la' : 'do',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 4. Khối Việc cần xử lý cho Học sinh
    const danhSachViec: ViecCanXuLy[] = cacBaiTapSapHan.map((bt) => ({
      id: `nop-bai-${bt.id}`,
      tieuDe: `Nộp bài tập: ${bt.tieuDe}`,
      moTa: `Hạn nộp: ${new Date(bt.hanNop).toLocaleString('vi-VN')}`,
      loai: 'NOP_BAI' as const,
      mucDoUuTien: 'CAO' as const,
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
