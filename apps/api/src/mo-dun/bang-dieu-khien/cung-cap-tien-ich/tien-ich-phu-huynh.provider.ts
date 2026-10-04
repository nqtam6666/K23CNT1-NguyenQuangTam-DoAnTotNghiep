import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien } from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchPhuHuynhProvider implements NhaCungCapTienIch {
  readonly id = 'theo-doi-phu-huynh';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.PHU_HUYNH;
  }

  async cungCapTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // Tìm các con em liên kết với phụ huynh này
    const danhSachLienKet = await this.prisma.phuHuynhHocSinh.findMany({
      where: { idPhuHuynh: nguoiDung.id },
      include: {
        hocSinh: {
          include: {
            nguoiDung: { select: { hoTen: true } },
          },
        },
      },
    });

    if (danhSachLienKet.length === 0) {
      return [];
    }

    const danhSachIdHocSinh = danhSachLienKet.map((lk) => lk.idHocSinh);
    const tenConDauTien = danhSachLienKet[0]?.hocSinh?.nguoiDung?.hoTen || 'Con em';

    // 1. Thẻ chuyên cần con em
    const banGhiDiemDanh = await this.prisma.banGhiDiemDanh.findMany({
      where: { idHocSinh: { in: danhSachIdHocSinh } },
      select: { trangThai: true },
    });

    const tongBuoi = banGhiDiemDanh.length;
    const coMat = banGhiDiemDanh.filter((b) => b.trangThai === 'CO_MAT').length;
    const tyLe = tongBuoi > 0 ? Math.round((coMat / tongBuoi) * 100) : 100;

    ketQua.push({
      id: 'the-chuyen-can-con-em',
      loai: 'THE_THONG_KE',
      tieuDe: 'Chuyên cần của con',
      moTa: `${tenConDauTien}: Có mặt ${coMat}/${tongBuoi || 1} buổi`,
      duongDanChiTiet: '/phu-huynh/con-em',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-chuyen-can-con-em',
        tieuDe: 'Chuyên cần của con',
        giaTri: `${tyLe}%`,
        moTa: `${tenConDauTien}: Có mặt ${coMat}/${tongBuoi || 1} buổi`,
        bieuTuong: 'UserCheck',
        mauSac: tyLe >= 80 ? 'xanh_la' : 'do',
        duongDanChiTiet: '/phu-huynh/con-em',
      },
    });

    // 2. Thẻ điểm mới nhất của con
    const diemMoiNhat = await this.prisma.diemSo.findFirst({
      where: { idHocSinh: { in: danhSachIdHocSinh } },
      orderBy: { ngayTao: 'desc' },
      include: {
        cotDiem: { select: { tenCotDiem: true } },
        hocSinh: { include: { nguoiDung: { select: { hoTen: true } } } },
      },
    });

    ketQua.push({
      id: 'the-diem-moi-nhat',
      loai: 'THE_THONG_KE',
      tieuDe: 'Điểm số mới nhất',
      moTa: diemMoiNhat ? `${diemMoiNhat.cotDiem.tenCotDiem}: ${diemMoiNhat.giaTri} điểm` : 'Chưa có cột điểm mới',
      duongDanChiTiet: '/phu-huynh/con-em',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-diem-moi-nhat',
        tieuDe: 'Điểm số mới nhất',
        giaTri: diemMoiNhat ? `${diemMoiNhat.giaTri}/10` : 'Chưa có',
        moTa: diemMoiNhat ? `${diemMoiNhat.cotDiem.tenCotDiem} (${diemMoiNhat.hocSinh.nguoiDung.hoTen})` : 'Cập nhật định kỳ',
        bieuTuong: 'GraduationCap',
        mauSac: 'tim',
        duongDanChiTiet: '/phu-huynh/con-em',
      },
    });

    // 3. Khối Việc cần xử lý cho Phụ huynh
    const danhSachViec = [
      {
        id: 'viec-theo-doi-chuyen-can',
        tieuDe: `Theo dõi tình hình học tập và điểm danh của ${tenConDauTien}`,
        moTa: 'Xem chi tiết nhật ký điểm danh và các buổi học sắp tới.',
        loai: 'KHAC' as const,
        mucDoUuTien: 'TRUNG_BINH' as const,
        duongDan: '/phu-huynh/con-em',
      },
    ];

    ketQua.push({
      id: 'viec-can-xu-ly-phu-huynh',
      loai: 'VIEC_CAN_XU_LY',
      tieuDe: 'Việc cần xử lý',
      trangThai: 'THANH_CONG',
      duLieu: danhSachViec,
    });

    return ketQua;
  }
}
