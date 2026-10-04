import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien } from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchGiaoVienProvider implements NhaCungCapTienIch {
  readonly id = 'giang-day-giao-vien';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.GIAO_VIEN;
  }

  async cungCapTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const ketQua: TienIchBangDieuKhien[] = [];

    // Tìm hồ sơ giáo viên
    const hoSoGiaoVien = await this.prisma.hoSoGiaoVien.findUnique({
      where: { idNguoiDung: nguoiDung.id },
      include: {
        cacLopGiangDay: { select: { id: true, tenLopHocPhan: true } },
      },
    });

    if (!hoSoGiaoVien) {
      return [];
    }

    const danhSachIdLop = hoSoGiaoVien.cacLopGiangDay.map((l) => l.id);

    // 1. Thẻ buổi dạy hôm nay
    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date();
    cuoiNgay.setHours(23, 59, 59, 999);

    const soBuoiDayHomNay = await this.prisma.buoiHoc.count({
      where: {
        idLopHocPhan: { in: danhSachIdLop },
        thoiGianBD: { gte: dauNgay, lte: cuoiNgay },
      },
    });

    ketQua.push({
      id: 'the-buoi-day-hom-nay',
      loai: 'THE_THONG_KE',
      tieuDe: 'Buổi dạy hôm nay',
      moTa: soBuoiDayHomNay > 0 ? `${soBuoiDayHomNay} ca dạy theo lịch` : 'Hôm nay không có lịch giảng dạy',
      duongDanChiTiet: '/thoi-khoa-bieu',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-buoi-day-hom-nay',
        tieuDe: 'Buổi dạy hôm nay',
        giaTri: soBuoiDayHomNay,
        donVi: 'buổi',
        moTa: 'Lịch giảng dạy hôm nay',
        bieuTuong: 'Video',
        mauSac: 'xanh_duong',
        duongDanChiTiet: '/thoi-khoa-bieu',
      },
    });

    // 2. Thẻ bài nộp chờ chấm
    const soBaiNopChoCham = await this.prisma.baiNop.count({
      where: {
        baiTap: { idLopHocPhan: { in: danhSachIdLop } },
        trangThai: 'DA_NOP',
      },
    });

    ketQua.push({
      id: 'the-bai-nop-cho-cham',
      loai: 'THE_THONG_KE',
      tieuDe: 'Bài nộp chờ chấm',
      moTa: soBaiNopChoCham > 0 ? `${soBaiNopChoCham} bài nộp của học sinh` : 'Đã chấm hết bài tập',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-bai-nop-cho-cham',
        tieuDe: 'Bài nộp chờ chấm',
        giaTri: soBaiNopChoCham,
        donVi: 'bài',
        moTa: soBaiNopChoCham > 0 ? 'Cần chấm điểm và nhận xét' : 'Hoàn thành tiến độ chấm',
        bieuTuong: 'GraduationCap',
        mauSac: soBaiNopChoCham > 0 ? 'cam' : 'xanh_la',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 3. Thẻ đơn xin nghỉ chờ duyệt
    const soDonXinNghiChoDuyet = await this.prisma.donXinNghi.count({
      where: {
        buoiHoc: { idLopHocPhan: { in: danhSachIdLop } },
        trangThai: 'CHO_DUYET',
      },
    });

    ketQua.push({
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
        moTa: soDonXinNghiChoDuyet > 0 ? 'Học sinh / Phụ huynh đã gửi' : 'Đã phản hồi toàn bộ',
        bieuTuong: 'Clock',
        mauSac: soDonXinNghiChoDuyet > 0 ? 'do' : 'xanh_la',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 4. Thẻ bản nháp AI chờ duyệt
    const soBanNhapAIChoDuyet = await this.prisma.banNhapAI.count({
      where: {
        idGiaoVien: hoSoGiaoVien.id,
        trangThai: 'CHO_DUYET',
      },
    });

    ketQua.push({
      id: 'the-ban-nhap-ai-cho-duyet',
      loai: 'THE_THONG_KE',
      tieuDe: 'Bản nháp AI chờ duyệt',
      moTa: soBanNhapAIChoDuyet > 0 ? `${soBanNhapAIChoDuyet} câu hỏi / nhận xét do AI tạo` : 'Không có bản nháp AI chờ duyệt',
      duongDanChiTiet: '/lop-hoc-phan',
      trangThai: 'THANH_CONG',
      duLieu: {
        id: 'the-ban-nhap-ai-cho-duyet',
        tieuDe: 'Bản nháp AI chờ duyệt',
        giaTri: soBanNhapAIChoDuyet,
        donVi: 'bản nháp',
        moTa: soBanNhapAIChoDuyet > 0 ? 'Kiểm tra trước khi ban hành' : 'Đã duyệt toàn bộ',
        bieuTuong: 'Bot',
        mauSac: 'tim',
        duongDanChiTiet: '/lop-hoc-phan',
      },
    });

    // 5. Khối Việc cần xử lý cho Giáo viên
    const danhSachViec = [];
    if (soBaiNopChoCham > 0) {
      danhSachViec.push({
        id: 'viec-cham-bai-nop',
        tieuDe: `Chấm ${soBaiNopChoCham} bài nộp của học sinh`,
        moTa: 'Nhiều bài tập đã quá hạn nộp cần được chấm điểm và trả bài.',
        loai: 'CHAM_DIEM',
        mucDoUuTien: 'CAO',
        duongDan: '/lop-hoc-phan',
      });
    }

    if (soDonXinNghiChoDuyet > 0) {
      danhSachViec.push({
        id: 'viec-duyet-don-nghi',
        tieuDe: `Duyệt ${soDonXinNghiChoDuyet} đơn xin nghỉ phép`,
        moTa: 'Học sinh có đơn xin nghỉ phép buổi học cần giáo viên xác nhận.',
        loai: 'DUYET_DON',
        mucDoUuTien: 'CAO',
        duongDan: '/lop-hoc-phan',
      });
    }

    if (soBanNhapAIChoDuyet > 0) {
      danhSachViec.push({
        id: 'viec-duyet-ban-nhap-ai',
        tieuDe: `Duyệt ${soBanNhapAIChoDuyet} nội dung bản nháp do Trợ lý AI tạo`,
        moTa: 'Câu hỏi kiểm tra và nhận xét tự động cần kiểm duyệt chất lượng.',
        loai: 'DUYET_AI',
        mucDoUuTien: 'TRUNG_BINH',
        duongDan: '/lop-hoc-phan',
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
