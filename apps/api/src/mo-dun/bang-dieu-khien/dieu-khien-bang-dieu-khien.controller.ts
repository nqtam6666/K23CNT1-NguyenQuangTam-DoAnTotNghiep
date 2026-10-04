import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuBangDieuKhien } from './dich-vu-bang-dieu-khien.service';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PayloadJwt, PhanHoiBangDieuKhien } from '@lms/chung';

@ApiTags('Bảng điều khiển & Tiện ích')
@ApiBearerAuth('JWT-auth')
@Controller('bang-dieu-khien')
@UseGuards(XacThucJwtGuard)
export class DieuKhienBangDieuKhien {
  constructor(private readonly dichVuBangDieuKhien: DichVuBangDieuKhien) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách tiện ích và dữ liệu thống kê bảng điều khiển theo vai trò người dùng',
  })
  @ApiResponse({ status: 200, description: 'Lấy dữ liệu bảng điều khiển thành công' })
  async layDuLieuBangDieuKhien(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<PhanHoiBangDieuKhien> {
    return this.dichVuBangDieuKhien.layDuLieuBangDieuKhien(nguoiDung);
  }
}
