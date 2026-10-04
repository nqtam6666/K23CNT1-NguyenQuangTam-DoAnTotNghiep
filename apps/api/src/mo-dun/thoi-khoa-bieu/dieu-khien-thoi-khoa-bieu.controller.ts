import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuThoiKhoaBieuService } from './dich-vu-thoi-khoa-bieu.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoThoiKhoaBieuSchema,
  TaoThoiKhoaBieuInput,
  capNhatThoiKhoaBieuSchema,
  CapNhatThoiKhoaBieuInput,
  taoBuoiHocSchema,
  TaoBuoiHocInput,
  capNhatBuoiHocSchema,
  CapNhatBuoiHocInput,
} from '@lms/chung';

@ApiTags('Quản lý Thời khóa biểu & Buổi học')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('thoi-khoa-bieu')
export class DieuKhienThoiKhoaBieuController {
  constructor(private readonly dichVuThoiKhoaBieu: DichVuThoiKhoaBieuService) {}

  // ==========================================
  // THỜI KHÓA BIỂU CÁ NHÂN
  // ==========================================

  @Get('ca-nhan')
  @ApiOperation({ summary: 'Xem thời khóa biểu tuần của người dùng hiện tại' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.ThoiKhoaBieu)
  async layThoiKhoaBieuCaNhan(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
    @Query('idHocKy') idHocKy?: string,
  ) {
    return this.dichVuThoiKhoaBieu.layThoiKhoaBieuCaNhan(nguoiDung, idHocKy);
  }

  // ==========================================
  // THỜI KHÓA BIỂU THEO LỚP
  // ==========================================

  @Get('lop/:idLopHocPhan')
  @ApiOperation({ summary: 'Xem thời khóa biểu tuần của một lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.ThoiKhoaBieu)
  async layThoiKhoaBieuTheoLop(@Param('idLopHocPhan', ParseUUIDPipe) idLopHocPhan: string) {
    return this.dichVuThoiKhoaBieu.layThoiKhoaBieuTheoLop(idLopHocPhan);
  }

  @Post('lop/:idLopHocPhan')
  @ApiOperation({ summary: 'Thêm tiết học vào thời khóa biểu lớp (kiểm tra xung đột)' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.ThoiKhoaBieu)
  async taoThoiKhoaBieu(
    @Param('idLopHocPhan', ParseUUIDPipe) idLopHocPhan: string,
    @Body(new ZodValidationPipe(taoThoiKhoaBieuSchema)) duLieu: TaoThoiKhoaBieuInput,
  ) {
    return this.dichVuThoiKhoaBieu.taoThoiKhoaBieu(idLopHocPhan, duLieu);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tiết học trong thời khóa biểu' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.ThoiKhoaBieu)
  async capNhatThoiKhoaBieu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatThoiKhoaBieuSchema)) duLieu: CapNhatThoiKhoaBieuInput,
  ) {
    return this.dichVuThoiKhoaBieu.capNhatThoiKhoaBieu(id, duLieu);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tiết học khỏi thời khóa biểu' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.ThoiKhoaBieu)
  async xoaThoiKhoaBieu(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuThoiKhoaBieu.xoaThoiKhoaBieu(id);
  }

  // ==========================================
  // TỰ ĐỘNG SINH BUỔI HỌC CHO CẢ HỌC KỲ
  // ==========================================

  @Post('lop/:idLopHocPhan/sinh-buoi-hoc')
  @ApiOperation({ summary: 'Tự động sinh toàn bộ danh sách buổi học theo thời khóa biểu' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BuoiHoc)
  async sinhBuoiHocTheoThoiKhoaBieu(@Param('idLopHocPhan', ParseUUIDPipe) idLopHocPhan: string) {
    return this.dichVuThoiKhoaBieu.sinhBuoiHocTheoThoiKhoaBieu(idLopHocPhan);
  }

  // ==========================================
  // BUỔI HỌC
  // ==========================================

  @Get('buoi-hoc/lop/:idLopHocPhan')
  @ApiOperation({ summary: 'Lấy danh sách các buổi học của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BuoiHoc)
  async layDanhSachBuoiHoc(@Param('idLopHocPhan', ParseUUIDPipe) idLopHocPhan: string) {
    return this.dichVuThoiKhoaBieu.layDanhSachBuoiHoc(idLopHocPhan);
  }

  @Post('buoi-hoc')
  @ApiOperation({ summary: 'Tạo một buổi học thủ công' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BuoiHoc)
  async taoBuoiHoc(@Body(new ZodValidationPipe(taoBuoiHocSchema)) duLieu: TaoBuoiHocInput) {
    return this.dichVuThoiKhoaBieu.taoBuoiHoc(duLieu);
  }

  @Patch('buoi-hoc/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin buổi học' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.BuoiHoc)
  async capNhatBuoiHoc(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatBuoiHocSchema)) duLieu: CapNhatBuoiHocInput,
  ) {
    return this.dichVuThoiKhoaBieu.capNhatBuoiHoc(id, duLieu);
  }

  @Delete('buoi-hoc/:id')
  @ApiOperation({ summary: 'Xóa buổi học' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BuoiHoc)
  async xoaBuoiHoc(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuThoiKhoaBieu.xoaBuoiHoc(id);
  }
}
