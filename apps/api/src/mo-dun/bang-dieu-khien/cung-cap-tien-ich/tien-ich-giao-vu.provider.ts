import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien } from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchGiaoVuProvider implements NhaCungCapTienIch {
  readonly id = 'hoc-vu-giao-vu';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.GIAO_VU || vaiTro === VaiTro.QUAN_TRI_VIEN;
  }

  async cungCapTienIch(_nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // 1. Thẻ lớp chưa phân công giáo viên chủ nhiệm
    const [soLopChuaPhanCong, tongSoLop] = await Promise.all([
      this.prisma.lopHanhChinh.count({
        where: { idGiaoVienCN: null },
      }),
      this.prisma.lopHocPhan.count(),
    ]);

    ketQua.push({
      id: 'the-lop-chua-phan-cong',
      loai: 'THE_THONG_KE',
      tieuDe: 'Lớp chưa phân công',
      moTa: soLopChuaPhanCong > 0 ? `${soLopChuaPhanCong} lớp cần gán giảng viên` : 'Tất cả lớp đã có giáo viên',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-lop-chua-phan-cong',
        tieuDe: 'Lớp chưa phân công',
        giaTri: soLopChuaPhanCong,
        donVi: 'lớp',
        moTa: soLopChuaPhanCong > 0 ? 'Cần bổ nhiệm giáo viên' : 'Đã đủ giáo viên',
        bieuTuong: 'UserCheck',
        mauSac: soLopChuaPhanCong > 0 ? 'cam' : 'xanh_la',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 2. Thẻ xung đột thời khóa biểu (kiểm tra các lịch cùng thứ, cùng tiết, cùng phòng)
    const danhSachTkb = await this.prisma.thoiKhoaBieu.findMany({
      select: {
        thuTrongTuan: true,
        tietBatDau: true,
        soTiet: true,
        phongHoc: true,
      },
    });

    let soXungDot = 0;
    for (let i = 0; i < danhSachTkb.length; i++) {
      for (let j = i + 1; j < danhSachTkb.length; j++) {
        const a = danhSachTkb[i];
        const b = danhSachTkb[j];
        if (
          a.phongHoc &&
          b.phongHoc &&
          a.phongHoc === b.phongHoc &&
          a.thuTrongTuan === b.thuTrongTuan
        ) {
          const aKetThuc = a.tietBatDau + a.soTiet - 1;
          const bKetThuc = b.tietBatDau + b.soTiet - 1;
          if (a.tietBatDau <= bKetThuc && b.tietBatDau <= aKetThuc) {
            soXungDot++;
          }
        }
      }
    }

    ketQua.push({
      id: 'the-xung-dot-thoi-khoa-bieu',
      loai: 'THE_THONG_KE',
      tieuDe: 'Xung đột thời khóa biểu',
      moTa: soXungDot > 0 ? `Phát hiện ${soXungDot} cặp trùng phòng/tiết` : 'Không có xung đột phòng học',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-xung-dot-thoi-khoa-bieu',
        tieuDe: 'Xung đột thời khóa biểu',
        giaTri: soXungDot,
        donVi: 'xung đột',
        moTa: soXungDot > 0 ? 'Cần điều chỉnh phòng/tiết' : 'Lịch trình chuẩn hóa',
        bieuTuong: 'Calendar',
        mauSac: soXungDot > 0 ? 'do' : 'xanh_la',
        duongDanChiTiet: '/thoi-khoa-bieu',
      },
    });

    // 3. Thẻ lần nhập Excel gần nhất
    const lanNhapGanNhat = await this.prisma.nhatKyHeThong.findFirst({
      where: {
        OR: [
          { hanhDong: { contains: 'EXCEL' } },
          { hanhDong: { contains: 'NHAP' } },
          { thucThe: 'GhiDanh' },
        ],
      },
      orderBy: { ngayTao: 'desc' },
      include: { nguoiDung: { select: { hoTen: true } } },
    });

    const thoiGianNhap = lanNhapGanNhat
      ? new Date(lanNhapGanNhat.ngayTao).toLocaleDateString('vi-VN')
      : 'Chưa có';

    ketQua.push({
      id: 'the-lan-nhap-excel-gan-nhat',
      loai: 'THE_THONG_KE',
      tieuDe: 'Nhập Excel gần nhất',
      moTa: lanNhapGanNhat ? `Bởi ${lanNhapGanNhat.nguoiDung?.hoTen || 'Hệ thống'}` : 'Chưa có lần nhập file nào',
      duongDanChiTiet: '/hoc-vu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-lan-nhap-excel-gan-nhat',
        tieuDe: 'Nhập Excel gần nhất',
        giaTri: thoiGianNhap,
        moTa: lanNhapGanNhat?.hanhDong || 'Dữ liệu chuẩn hóa',
        bieuTuong: 'FileSpreadsheet',
        mauSac: 'xanh_duong',
        duongDanChiTiet: '/hoc-vu',
      },
    });

    // 4. Khối Việc cần xử lý cho Giáo vụ
    const danhSachViec = [];
    if (soLopChuaPhanCong > 0) {
      danhSachViec.push({
        id: 'viec-phan-cong-lop',
        tieuDe: `Phân công giảng viên cho ${soLopChuaPhanCong} lớp học phần`,
        moTa: 'Các lớp chưa có giảng viên phụ trách cần gán trước khi học kỳ bắt đầu.',
        loai: 'XEP_LICH',
        mucDoUuTien: 'CAO',
        duongDan: '/lop-hoc-phan',
      });
    }

    if (soXungDot > 0) {
      danhSachViec.push({
        id: 'viec-sua-xung-dot-tkb',
        tieuDe: `Xử lý ${soXungDot} xung đột phòng học trên thời khóa biểu`,
        moTa: 'Phát hiện phòng học bị trùng tiết cần dời hoặc đổi phòng.',
        loai: 'XEP_LICH',
        mucDoUuTien: 'CAO',
        duongDan: '/thoi-khoa-bieu',
      });
    }

    if (danhSachViec.length === 0) {
      danhSachViec.push({
        id: 'viec-kiem-tra-dinh-ky',
        tieuDe: 'Rà soát danh sách học sinh và thời khóa biểu',
        moTa: 'Tất cả dữ liệu học vụ hiện tại đang ở trạng thái chuẩn mực.',
        loai: 'KHAC',
        mucDoUuTien: 'THAP',
        duongDan: '/hoc-vu',
      });
    }

    ketQua.push({
      id: 'viec-can-xu-ly-giao-vu',
      loai: 'VIEC_CAN_XU_LY',
      tieuDe: 'Việc cần xử lý',
      trangThai: 'THANH_CONG',
      duLieu: danhSachViec,
    });

    return ketQua;
  }
}
