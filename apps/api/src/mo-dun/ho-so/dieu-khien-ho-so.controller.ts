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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuHoSo } from './dich-vu-ho-so.service';
import {
  capNhatHoSoSchema,
  taoHoSoHocSinhSchema,
  capNhatHoSoHocSinhSchema,
  truyVanHoSoHocSinhSchema,
  taoHoSoGiaoVienSchema,
  capNhatHoSoGiaoVienSchema,
  thietLapLienKetPhuHuynhSchema,
  truyVanPhanTrangSchema,
  CapNhatHoSoDto,
  TaoHoSoHocSinhDto,
  CapNhatHoSoHocSinhDto,
  TruyVanHoSoHocSinhDto,
  TaoHoSoGiaoVienDto,
  CapNhatHoSoGiaoVienDto,
  ThietLapLienKetPhuHuynhDto,
  TruyVanPhanTrangDto,
  HanhDong,
  DoiTuong,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';

@ApiTags('Quản lý Hồ sơ & Học vụ')
@ApiBearerAuth('JWT-auth')
@Controller('ho-so')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
export class DieuKhienHoSo {
  constructor(private readonly dichVuHoSo: DichVuHoSo) {}

  // ==================== HỒ SƠ CÁ NHÂN ====================

  @Get('ca-nhan')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ của người dùng đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Hồ sơ cá nhân trả về thành công' })
  async layHoSoCaNhan(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuHoSo.layHoSoCaNhan(nguoiDung.id, nguoiDung.vaiTro as VaiTro);
  }

  @Patch('ca-nhan')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân cơ bản' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  async capNhatHoSoCaNhan(
    @NguoiDungHienTai('id') idNguoiDung: string,
    @Body(new ZodValidationPipe(capNhatHoSoSchema)) duLieu: CapNhatHoSoDto,
  ) {
    return this.dichVuHoSo.capNhatHoSoCaNhan(idNguoiDung, duLieu);
  }

  @Get('con-em')
  @ApiOperation({ summary: 'Lấy danh sách con em của tài khoản phụ huynh đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Danh sách con em trả về thành công' })
  async layDanhSachConEm(@NguoiDungHienTai('id') idPhuHuynh: string) {
    return this.dichVuHoSo.layDanhSachConEm(idPhuHuynh);
  }

  // ==================== HỒ SƠ HỌC SINH ====================

  @Get('hoc-sinh')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HoSoHocSinh)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ học sinh' })
  @ApiResponse({ status: 200, description: 'Danh sách học sinh trả về thành công' })
  async layDanhSachHocSinh(
    @Query(new ZodValidationPipe(truyVanHoSoHocSinhSchema)) thamSo: TruyVanHoSoHocSinhDto,
  ) {
    return this.dichVuHoSo.layDanhSachHocSinh(thamSo);
  }

  @Get('hoc-sinh/:id')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HoSoHocSinh)
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ một học sinh (Kiểm tra chống IDOR)' })
  @ApiResponse({ status: 200, description: 'Hồ sơ học sinh trả về thành công' })
  async layChiTietHocSinh(
    @Param('id') id: string,
    @NguoiDungHienTai() nguoiDungHienTai: PayloadJwt,
  ) {
    return this.dichVuHoSo.layChiTietHocSinh(id, nguoiDungHienTai);
  }

  @Post('hoc-sinh')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.HoSoHocSinh)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo hồ sơ học sinh mới' })
  @ApiResponse({ status: 201, description: 'Tạo hồ sơ học sinh thành công' })
  async taoHoSoHocSinh(
    @Body(new ZodValidationPipe(taoHoSoHocSinhSchema)) duLieu: TaoHoSoHocSinhDto,
  ) {
    return this.dichVuHoSo.taoHoSoHocSinh(duLieu);
  }

  @Patch('hoc-sinh/:id')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.HoSoHocSinh)
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ học sinh' })
  @ApiResponse({ status: 200, description: 'Cập nhật hồ sơ học sinh thành công' })
  async capNhatHoSoHocSinh(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(capNhatHoSoHocSinhSchema)) duLieu: CapNhatHoSoHocSinhDto,
  ) {
    return this.dichVuHoSo.capNhatHoSoHocSinh(id, duLieu);
  }

  // ==================== HỒ SƠ GIÁO VIÊN ====================

  @Get('giao-vien')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HoSoGiaoVien)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ giáo viên' })
  @ApiResponse({ status: 200, description: 'Danh sách giáo viên trả về thành công' })
  async layDanhSachGiaoVien(
    @Query(new ZodValidationPipe(truyVanPhanTrangSchema)) thamSo: TruyVanPhanTrangDto,
  ) {
    return this.dichVuHoSo.layDanhSachGiaoVien(thamSo);
  }

  @Get('giao-vien/:id')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.HoSoGiaoVien)
  @ApiOperation({ summary: 'Xem chi tiết hồ sơ một giáo viên' })
  @ApiResponse({ status: 200, description: 'Hồ sơ giáo viên trả về thành công' })
  async layChiTietGiaoVien(@Param('id') id: string) {
    return this.dichVuHoSo.layChiTietGiaoVien(id);
  }

  @Post('giao-vien')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.HoSoGiaoVien)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo hồ sơ giáo viên mới' })
  @ApiResponse({ status: 201, description: 'Tạo hồ sơ giáo viên thành công' })
  async taoHoSoGiaoVien(
    @Body(new ZodValidationPipe(taoHoSoGiaoVienSchema)) duLieu: TaoHoSoGiaoVienDto,
  ) {
    return this.dichVuHoSo.taoHoSoGiaoVien(duLieu);
  }

  @Patch('giao-vien/:id')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.HoSoGiaoVien)
  @ApiOperation({ summary: 'Cập nhật thông tin hồ sơ giáo viên' })
  @ApiResponse({ status: 200, description: 'Cập nhật hồ sơ giáo viên thành công' })
  async capNhatHoSoGiaoVien(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(capNhatHoSoGiaoVienSchema)) duLieu: CapNhatHoSoGiaoVienDto,
  ) {
    return this.dichVuHoSo.capNhatHoSoGiaoVien(id, duLieu);
  }

  // ==================== LIÊN KẾT PHỤ HUYNH ====================

  @Post('lien-ket-phu-huynh')
  @KiemTraQuyen(HanhDong.QuanLy, DoiTuong.HoSoHocSinh)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thiết lập liên kết Phụ huynh - Học sinh' })
  @ApiResponse({ status: 200, description: 'Thiết lập liên kết thành công' })
  async thietLapLienKetPhuHuynh(
    @Body(new ZodValidationPipe(thietLapLienKetPhuHuynhSchema)) duLieu: ThietLapLienKetPhuHuynhDto,
  ) {
    return this.dichVuHoSo.thietLapLienKetPhuHuynh(duLieu);
  }

  @Delete('lien-ket-phu-huynh/:idPhuHuynh/:idHocSinh')
  @KiemTraQuyen(HanhDong.QuanLy, DoiTuong.HoSoHocSinh)
  @ApiOperation({ summary: 'Xóa liên kết Phụ huynh - Học sinh' })
  @ApiResponse({ status: 200, description: 'Xóa liên kết thành công' })
  async xoaLienKetPhuHuynh(
    @Param('idPhuHuynh') idPhuHuynh: string,
    @Param('idHocSinh') idHocSinh: string,
  ) {
    return this.dichVuHoSo.xoaLienKetPhuHuynh(idPhuHuynh, idHocSinh);
  }
}
