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
import { DichVuNguoiDung } from './dich-vu-nguoi-dung.service';
import {
  taoNguoiDungSchema,
  capNhatNguoiDungSchema,
  chuyenTrangThaiNguoiDungSchema,
  datLaiMatKhauAdminSchema,
  truyVanNguoiDungSchema,
  TaoNguoiDungDto,
  CapNhatNguoiDungDto,
  ChuyenTrangThaiNguoiDungDto,
  DatLaiMatKhauAdminDto,
  TruyVanNguoiDungDto,
  HanhDong,
  DoiTuong,
  PayloadJwt,
} from '@lms/chung';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';

@ApiTags('Quản lý Người dùng')
@ApiBearerAuth('JWT-auth')
@Controller('nguoi-dung')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
export class DieuKhienNguoiDung {
  constructor(private readonly dichVuNguoiDung: DichVuNguoiDung) {}

  @Get()
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.NguoiDung)
  @ApiOperation({ summary: 'Lấy danh sách người dùng có phân trang và bộ lọc' })
  @ApiResponse({ status: 200, description: 'Danh sách người dùng trả về thành công' })
  async layDanhSach(@Query(new ZodValidationPipe(truyVanNguoiDungSchema)) thamSo: TruyVanNguoiDungDto) {
    return this.dichVuNguoiDung.layDanhSach(thamSo);
  }

  @Post()
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.NguoiDung)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo tài khoản người dùng mới' })
  @ApiResponse({ status: 201, description: 'Người dùng được tạo thành công' })
  async taoMoi(@Body(new ZodValidationPipe(taoNguoiDungSchema)) duLieu: TaoNguoiDungDto) {
    return this.dichVuNguoiDung.taoMoi(duLieu);
  }

  @Get(':id')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.NguoiDung)
  @ApiOperation({ summary: 'Xem chi tiết thông tin một người dùng' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết người dùng' })
  async layChiTiet(@Param('id') id: string) {
    return this.dichVuNguoiDung.layChiTiet(id);
  }

  @Patch(':id')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.NguoiDung)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  async capNhat(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(capNhatNguoiDungSchema)) duLieu: CapNhatNguoiDungDto,
  ) {
    return this.dichVuNguoiDung.capNhat(id, duLieu);
  }

  @Patch(':id/trang-thai')
  @KiemTraQuyen(HanhDong.QuanLy, DoiTuong.NguoiDung)
  @ApiOperation({ summary: 'Bật / Khóa tài khoản người dùng' })
  @ApiResponse({ status: 200, description: 'Chuyển đổi trạng thái thành công' })
  async chuyenTrangThai(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(chuyenTrangThaiNguoiDungSchema)) duLieu: ChuyenTrangThaiNguoiDungDto,
    @NguoiDungHienTai() nguoiDungHienTai: PayloadJwt,
  ) {
    return this.dichVuNguoiDung.chuyenTrangThai(id, duLieu, nguoiDungHienTai.id);
  }

  @Post(':id/dat-lai-mat-khau')
  @KiemTraQuyen(HanhDong.QuanLy, DoiTuong.NguoiDung)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quản trị viên đặt lại mật khẩu cho người dùng' })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  async datLaiMatKhau(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(datLaiMatKhauAdminSchema)) duLieu: DatLaiMatKhauAdminDto,
  ) {
    return this.dichVuNguoiDung.datLaiMatKhau(id, duLieu);
  }

  @Delete(':id')
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.NguoiDung)
  @ApiOperation({ summary: 'Xóa mềm tài khoản người dùng' })
  @ApiResponse({ status: 200, description: 'Xóa người dùng thành công' })
  async xoa(
    @Param('id') id: string,
    @NguoiDungHienTai() nguoiDungHienTai: PayloadJwt,
  ) {
    return this.dichVuNguoiDung.xoa(id, nguoiDungHienTai.id);
  }
}
