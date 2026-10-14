import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuSoDiemService } from './dich-vu-so-diem.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoCotDiemSchema,
  TaoCotDiemInput,
  luuBangDiemHangLoatSchema,
  LuuBangDiemHangLoatInput,
} from '@lms/chung';

@ApiTags('Quản lý Kết quả học phần & Sổ điểm thông minh')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('so-diem')
export class DieuKhienSoDiemController {
  constructor(private readonly dichVuSoDiem: DichVuSoDiemService) {}

  @Get('lop/:idLop')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.SoDiem)
  @ApiOperation({ summary: 'Lấy bảng điểm tổng hợp và thống kê kết quả học phần' })
  async layBangDiemLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuSoDiem.layBangDiemLopHocPhan(idLop, nguoiDung);
    return {
      thanhCong: true,
      duLieu,
    };
  }

  @Post('lop/:idLop/cot-diem')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.CotDiem)
  @ApiOperation({ summary: 'Thêm cột điểm thành phần mới cho lớp học phần' })
  async taoCotDiem(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(taoCotDiemSchema)) duLieu: TaoCotDiemInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuSoDiem.taoCotDiem(idLop, duLieu, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Đã thêm cột điểm "${ketQua.tenCotDiem}" (Hệ số ${ketQua.heSo})`,
      duLieu: ketQua,
    };
  }

  @Delete('cot-diem/:idCotDiem')
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.CotDiem)
  @ApiOperation({ summary: 'Xóa một cột điểm khỏi sổ điểm học phần' })
  async xoaCotDiem(
    @Param('idCotDiem', ParseUUIDPipe) idCotDiem: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    await this.dichVuSoDiem.xoaCotDiem(idCotDiem, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: 'Đã xóa cột điểm thành công',
    };
  }

  @Post('lop/:idLop/luu-diem')
  @KiemTraQuyen(HanhDong.ChamDiem, DoiTuong.DiemSo)
  @ApiOperation({ summary: 'Lưu điểm số học phần hàng loạt' })
  async luuBangDiem(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(luuBangDiemHangLoatSchema)) duLieu: LuuBangDiemHangLoatInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuSoDiem.luuBangDiemHangLoat(idLop, duLieu, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Đã lưu thành công ${ketQua.soLuongCapNhat} đầu điểm vào sổ điểm học phần`,
      duLieu: ketQua,
    };
  }

  @Post('lop/:idLop/dong-bo-tu-dong')
  @KiemTraQuyen(HanhDong.ChamDiem, DoiTuong.SoDiem)
  @ApiOperation({
    summary: 'Đồng bộ tự động điểm Chuyên cần, Luyện tập/Bài tập và Thi thử vào Sổ điểm học phần',
  })
  async dongBoDiemTuDong(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuSoDiem.dongBoDiemTuDong(idLop, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Đã đồng bộ tự động ${ketQua.soLuongDongBo} đầu điểm từ Điểm danh, Luyện tập và Thi thử`,
      duLieu: ketQua,
    };
  }

  @Post('lop/:idLop/hoc-sinh/:idHocSinh/nhan-xet-ai')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.SoDiem)
  @ApiOperation({
    summary: 'Sử dụng AI phân tích kết quả học phần và gợi ý lộ trình học tập cho học sinh',
  })
  async sinhNhanXetHocPhanAI(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Param('idHocSinh', ParseUUIDPipe) idHocSinh: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuSoDiem.sinhNhanXetHocPhanAI(idLop, idHocSinh, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Đã phân tích kết quả học phần cho ${duLieu.hoTen}`,
      duLieu,
    };
  }
}
