import { Controller, Get, Patch, Post, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuBangDieuKhien } from './dich-vu-bang-dieu-khien.service';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import {
  PayloadJwt,
  PhanHoiBangDieuKhien,
  PhanHoiThongBaoBangDieuKhien,
  KetQuaGuiThuThongBaoDaKenh,
} from '@lms/chung';

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

  @Get('thong-bao')
  @ApiOperation({
    summary: 'Lấy danh sách thông báo học vụ và vận hành thực tế theo vai trò người dùng',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thông báo thực tế thành công' })
  async layDanhSachThongBaoThucTe(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<PhanHoiThongBaoBangDieuKhien> {
    return this.dichVuBangDieuKhien.layDanhSachThongBaoThucTe(nguoiDung);
  }

  @Patch('thong-bao/:id/da-doc')
  @ApiOperation({
    summary: 'Đánh dấu 1 thông báo của người dùng hiện tại là đã đọc',
  })
  @ApiResponse({ status: 200, description: 'Đánh dấu đã đọc thành công' })
  async danhDauDaDocThongBao(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<{ thanhCong: boolean }> {
    return this.dichVuBangDieuKhien.danhDauDaDocThongBao(id, nguoiDung);
  }

  @Post('thong-bao/doc-tat-ca')
  @ApiOperation({
    summary: 'Đánh dấu toàn bộ thông báo của người dùng hiện tại là đã đọc',
  })
  @ApiResponse({ status: 200, description: 'Đánh dấu đọc tất cả thành công' })
  async danhDauDocTatCaThongBao(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<{ thanhCong: boolean; soLuongCapNhat: number }> {
    return this.dichVuBangDieuKhien.danhDauDocTatCaThongBao(nguoiDung);
  }

  @Post('thong-bao/gui-thu')
  @ApiOperation({
    summary: 'Gửi thử thông báo đồng bộ trên 3 kênh (Nền tảng, Windows, Gmail) cho người dùng hiện tại',
  })
  @ApiResponse({ status: 200, description: 'Đã phát thông báo thử nghiệm đa kênh' })
  async guiThuThongBaoDaKenh(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<KetQuaGuiThuThongBaoDaKenh> {
    return this.dichVuBangDieuKhien.guiThuThongBaoDaKenh(nguoiDung);
  }
}

