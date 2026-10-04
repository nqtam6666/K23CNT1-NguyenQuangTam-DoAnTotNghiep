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
import { DichVuHocVuService } from './dich-vu-hoc-vu.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  taoNamHocSchema,
  TaoNamHocInput,
  capNhatNamHocSchema,
  CapNhatNamHocInput,
  taoHocKySchema,
  TaoHocKyInput,
  capNhatHocKySchema,
  CapNhatHocKyInput,
  taoMonHocSchema,
  TaoMonHocInput,
  capNhatMonHocSchema,
  CapNhatMonHocInput,
  truyVanMonHocSchema,
  TruyVanMonHocInput,
  taoLopHanhChinhSchema,
  TaoLopHanhChinhInput,
  capNhatLopHanhChinhSchema,
  CapNhatLopHanhChinhInput,
  truyVanLopHanhChinhSchema,
  TruyVanLopHanhChinhInput,
} from '@lms/chung';

@ApiTags('Quản lý Học vụ')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('hoc-vu')
export class DieuKhienHocVuController {
  constructor(private readonly dichVuHocVu: DichVuHocVuService) {}

  // ==========================================
  // NĂM HỌC
  // ==========================================

  @Get('nam-hoc')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các năm học' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.NamHoc)
  async layDanhSachNamHoc() {
    return this.dichVuHocVu.layDanhSachNamHoc();
  }

  @Get('nam-hoc/:id')
  @ApiOperation({ summary: 'Xem chi tiết một năm học' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.NamHoc)
  async layChiTietNamHoc(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.layChiTietNamHoc(id);
  }

  @Post('nam-hoc')
  @ApiOperation({ summary: 'Tạo năm học mới' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.NamHoc)
  async taoNamHoc(@Body(new ZodValidationPipe(taoNamHocSchema)) duLieu: TaoNamHocInput) {
    return this.dichVuHocVu.taoNamHoc(duLieu);
  }

  @Patch('nam-hoc/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin năm học' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.NamHoc)
  async capNhatNamHoc(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatNamHocSchema)) duLieu: CapNhatNamHocInput,
  ) {
    return this.dichVuHocVu.capNhatNamHoc(id, duLieu);
  }

  @Delete('nam-hoc/:id')
  @ApiOperation({ summary: 'Xóa năm học' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.NamHoc)
  async xoaNamHoc(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.xoaNamHoc(id);
  }

  // ==========================================
  // HỌC KỲ
  // ==========================================

  @Get('hoc-ky')
  @ApiOperation({ summary: 'Lấy danh sách học kỳ (tùy chọn theo năm học)' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HocKy)
  async layDanhSachHocKy(@Query('idNamHoc') idNamHoc?: string) {
    return this.dichVuHocVu.layDanhSachHocKy(idNamHoc);
  }

  @Get('hoc-ky/:id')
  @ApiOperation({ summary: 'Xem chi tiết học kỳ' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HocKy)
  async layChiTietHocKy(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.layChiTietHocKy(id);
  }

  @Post('hoc-ky')
  @ApiOperation({ summary: 'Tạo học kỳ mới' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.HocKy)
  async taoHocKy(@Body(new ZodValidationPipe(taoHocKySchema)) duLieu: TaoHocKyInput) {
    return this.dichVuHocVu.taoHocKy(duLieu);
  }

  @Patch('hoc-ky/:id')
  @ApiOperation({ summary: 'Cập nhật học kỳ' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.HocKy)
  async capNhatHocKy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatHocKySchema)) duLieu: CapNhatHocKyInput,
  ) {
    return this.dichVuHocVu.capNhatHocKy(id, duLieu);
  }

  @Delete('hoc-ky/:id')
  @ApiOperation({ summary: 'Xóa học kỳ' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.HocKy)
  async xoaHocKy(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.xoaHocKy(id);
  }

  // ==========================================
  // MÔN HỌC
  // ==========================================

  @Get('mon-hoc')
  @ApiOperation({ summary: 'Lấy danh sách môn học có phân trang & tìm kiếm' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.MonHoc)
  async layDanhSachMonHoc(
    @Query(new ZodValidationPipe(truyVanMonHocSchema)) truyVan: TruyVanMonHocInput,
  ) {
    return this.dichVuHocVu.layDanhSachMonHoc(truyVan);
  }

  @Get('mon-hoc/:id')
  @ApiOperation({ summary: 'Xem chi tiết môn học' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.MonHoc)
  async layChiTietMonHoc(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.layChiTietMonHoc(id);
  }

  @Post('mon-hoc')
  @ApiOperation({ summary: 'Tạo môn học mới' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.MonHoc)
  async taoMonHoc(@Body(new ZodValidationPipe(taoMonHocSchema)) duLieu: TaoMonHocInput) {
    return this.dichVuHocVu.taoMonHoc(duLieu);
  }

  @Patch('mon-hoc/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin môn học' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.MonHoc)
  async capNhatMonHoc(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatMonHocSchema)) duLieu: CapNhatMonHocInput,
  ) {
    return this.dichVuHocVu.capNhatMonHoc(id, duLieu);
  }

  @Delete('mon-hoc/:id')
  @ApiOperation({ summary: 'Xóa môn học' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.MonHoc)
  async xoaMonHoc(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.xoaMonHoc(id);
  }

  // ==========================================
  // LỚP HÀNH CHÍNH
  // ==========================================

  @Get('lop-hanh-chinh')
  @ApiOperation({ summary: 'Lấy danh sách lớp hành chính' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.LopHanhChinh)
  async layDanhSachLopHanhChinh(
    @Query(new ZodValidationPipe(truyVanLopHanhChinhSchema)) truyVan: TruyVanLopHanhChinhInput,
  ) {
    return this.dichVuHocVu.layDanhSachLopHanhChinh(truyVan);
  }

  @Get('lop-hanh-chinh/:id')
  @ApiOperation({ summary: 'Xem chi tiết lớp hành chính và danh sách học sinh' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.LopHanhChinh)
  async layChiTietLopHanhChinh(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.layChiTietLopHanhChinh(id);
  }

  @Post('lop-hanh-chinh')
  @ApiOperation({ summary: 'Tạo lớp hành chính mới' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.LopHanhChinh)
  async taoLopHanhChinh(
    @Body(new ZodValidationPipe(taoLopHanhChinhSchema)) duLieu: TaoLopHanhChinhInput,
  ) {
    return this.dichVuHocVu.taoLopHanhChinh(duLieu);
  }

  @Patch('lop-hanh-chinh/:id')
  @ApiOperation({ summary: 'Cập nhật thông tin lớp hành chính' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.LopHanhChinh)
  async capNhatLopHanhChinh(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatLopHanhChinhSchema)) duLieu: CapNhatLopHanhChinhInput,
  ) {
    return this.dichVuHocVu.capNhatLopHanhChinh(id, duLieu);
  }

  @Delete('lop-hanh-chinh/:id')
  @ApiOperation({ summary: 'Xóa lớp hành chính' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.LopHanhChinh)
  async xoaLopHanhChinh(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuHocVu.xoaLopHanhChinh(id);
  }
}
