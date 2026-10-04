import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien } from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchTongQuanProvider implements NhaCungCapTienIch {
  readonly id = 'tong-quan-he-thong';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.BAN_GIAM_HIEU;
  }

  async cungCapTienIch(_nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // 1. Thẻ tổng người dùng và tài khoản bị khóa
    const [tongSoNguoiDung, soTaiKhoanBiKhoa, phanBoVaiTro] = await Promise.all([
      this.prisma.nguoiDung.count({ where: { ngayXoa: null } }),
      this.prisma.nguoiDung.count({ where: { kichHoat: false, ngayXoa: null } }),
      this.prisma.nguoiDung.groupBy({
        by: ['vaiTro'],
        where: { ngayXoa: null },
        _count: { id: true },
      }),
    ]);

    ketQua.push({
      id: 'the-tong-nguoi-dung',
      loai: 'THE_THONG_KE',
      tieuDe: 'Tổng người dùng',
      moTa: soTaiKhoanBiKhoa > 0 ? `${soTaiKhoanBiKhoa} tài khoản đang bị khóa` : 'Tất cả tài khoản đang hoạt động',
      duongDanChiTiet: '/nguoi-dung',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-tong-nguoi-dung',
        tieuDe: 'Tổng người dùng',
        giaTri: tongSoNguoiDung,
        donVi: 'người dùng',
        moTa: soTaiKhoanBiKhoa > 0 ? `${soTaiKhoanBiKhoa} tài khoản bị khóa` : 'Hoạt động bình thường',
        bieuTuong: 'Users',
        mauSac: 'xanh_duong',
        duongDanChiTiet: '/nguoi-dung',
      },
    });

    // 2. Thẻ số lớp học phần đang mở
    const soLopDangMo = await this.prisma.lopHocPhan.count({
      where: { kichHoat: true },
    });

    ketQua.push({
      id: 'the-lop-hoc-phan-dang-mo',
      loai: 'THE_THONG_KE',
      tieuDe: 'Lớp học phần đang mở',
      moTa: 'Lớp học phần có sinh viên đang theo học',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-lop-hoc-phan-dang-mo',
        tieuDe: 'Lớp học phần đang mở',
        giaTri: soLopDangMo,
        donVi: 'lớp',
        moTa: 'Đang hoạt động trong kỳ',
        bieuTuong: 'BookOpen',
        mauSac: 'tim',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 3. Thẻ số buổi học hôm nay
    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date();
    cuoiNgay.setHours(23, 59, 59, 999);

    const soBuoiHocHomNay = await this.prisma.buoiHoc.count({
      where: {
        thoiGianBD: {
          gte: dauNgay,
          lte: cuoiNgay,
        },
      },
    });

    ketQua.push({
      id: 'the-buoi-hoc-hom-nay',
      loai: 'THE_THONG_KE',
      tieuDe: 'Buổi học hôm nay',
      moTa: 'Số ca học và phòng trực tuyến theo lịch',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-buoi-hoc-hom-nay',
        tieuDe: 'Buổi học hôm nay',
        giaTri: soBuoiHocHomNay,
        donVi: 'buổi',
        moTa: 'Thời khóa biểu hôm nay',
        bieuTuong: 'Calendar',
        mauSac: 'xanh_la',
        duongDanChiTiet: '/thoi-khoa-bieu',
      },
    });

    // 4. Biểu đồ phân bố người dùng theo vai trò
    const BAN_DO_TEN_VAI_TRO: Record<string, string> = {
      QUAN_TRI_VIEN: 'Quản trị viên',
      BAN_GIAM_HIEU: 'Ban giám hiệu',
      GIAO_VU: 'Giáo vụ',
      GIAO_VIEN: 'Giáo viên',
      HOC_SINH: 'Học sinh',
      PHU_HUYNH: 'Phụ huynh',
    };

    const duLieuPhanBo = phanBoVaiTro.map((item) => ({
      ten: BAN_DO_TEN_VAI_TRO[item.vaiTro] || item.vaiTro,
      giaTri: item._count.id,
      vaiTro: item.vaiTro,
    }));

    ketQua.push({
      id: 'bieu-do-phan-bo-vai-tro',
      loai: 'BIEU_DO',
      tieuDe: 'Cơ cấu người dùng theo vai trò',
      duongDanChiTiet: '/nguoi-dung',
      trangThai: 'THANH_CONG',
      duLieu: duLieuPhanBo,
    });

    // 5. Biểu đồ tỷ lệ chuyên cần 7 ngày gần nhất
    const bayNgayTruoc = new Date();
    bayNgayTruoc.setDate(bayNgayTruoc.getDate() - 6);
    bayNgayTruoc.setHours(0, 0, 0, 0);

    const danhSachDiemDanh = await this.prisma.banGhiDiemDanh.findMany({
      where: {
        ngayDiemDanh: { gte: bayNgayTruoc },
      },
      select: {
        trangThai: true,
        ngayDiemDanh: true,
      },
    });

    // Nhóm theo từng ngày trong 7 ngày
    const duLieuChuyenCan = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const chuoiNgay = `${d.getDate()}/${d.getMonth() + 1}`;
      const banGhiTrongNgay = danhSachDiemDanh.filter((bg) => {
        const bd = new Date(bg.ngayDiemDanh);
        return bd.getDate() === d.getDate() && bd.getMonth() === d.getMonth();
      });

      const tong = banGhiTrongNgay.length;
      const coMat = banGhiTrongNgay.filter((bg) => bg.trangThai === 'CO_MAT').length;
      const tyLe = tong > 0 ? Math.round((coMat / tong) * 100) : 100;

      duLieuChuyenCan.push({
        ngay: chuoiNgay,
        tyLe,
        tongSo: tong,
        coMat,
      });
    }

    ketQua.push({
      id: 'bieu-do-chuyen-can-7-ngay',
      loai: 'BIEU_DO',
      tieuDe: 'Tỷ lệ chuyên cần 7 ngày gần nhất',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: duLieuChuyenCan,
    });

    return ketQua;
  }
}
