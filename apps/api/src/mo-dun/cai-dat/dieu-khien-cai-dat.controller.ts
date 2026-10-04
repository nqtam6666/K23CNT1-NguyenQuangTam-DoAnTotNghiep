import { Controller, Get, Put, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuCaiDatService } from './dich-vu-cai-dat.service';
import {
  soDoCapNhatCaiDat,
  soDoCapNhatMotCaiDat,
  CapNhatCaiDatInput,
  CapNhatMotCaiDatInput,
  HanhDong,
  DoiTuong,
} from '@lms/chung';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { CongKhai } from '../../cot-loi/trang-tri/cong-khai.decorator';

@ApiTags('Cài đặt Hệ thống')
@Controller('cai-dat')
export class DieuKhienCaiDatController {
  constructor(private readonly dichVuCaiDat: DichVuCaiDatService) {}

  @Get('cong-khai')
  @CongKhai()
  @ApiOperation({
    summary: 'Lấy bản đồ cấu hình công khai cho giao diện khách (Landing page, Sidebar, v.v.)',
  })
  @ApiResponse({ status: 200, description: 'Trả về cấu hình công khai dạng key-value' })
  async layBanDoCaiDatCongKhai() {
    return this.dichVuCaiDat.layBanDoCaiDatCongKhai();
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách cài đặt hệ thống (Quản trị viên)' })
  @ApiResponse({ status: 200, description: 'Danh sách cài đặt hệ thống đầy đủ' })
  async layDanhSachCaiDat() {
    return this.dichVuCaiDat.layDanhSachCaiDat();
  }

  @Get(':khoa')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Lấy chi tiết một cấu hình hệ thống theo khóa' })
  @ApiResponse({ status: 200, description: 'Chi tiết cấu hình hệ thống' })
  async layTheoKhoa(@Param('khoa') khoa: string) {
    return this.dichVuCaiDat.layTheoKhoa(khoa);
  }

  @Put()
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Cập nhật hàng loạt cấu hình hệ thống (Quản trị viên)' })
  @ApiResponse({ status: 200, description: 'Số lượng cấu hình đã cập nhật thành công' })
  async capNhatNhieu(@Body(new ZodValidationPipe(soDoCapNhatCaiDat)) duLieu: CapNhatCaiDatInput) {
    return this.dichVuCaiDat.capNhatNhieu(duLieu.danhSachCaiDat);
  }

  @Patch(':khoa')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Cập nhật giá trị một cấu hình theo khóa' })
  @ApiResponse({ status: 200, description: 'Cấu hình được cập nhật thành công' })
  async capNhatMot(
    @Param('khoa') khoa: string,
    @Body(new ZodValidationPipe(soDoCapNhatMotCaiDat)) duLieu: CapNhatMotCaiDatInput,
  ) {
    return this.dichVuCaiDat.capNhatMot(khoa, duLieu.giaTri);
  }
}
