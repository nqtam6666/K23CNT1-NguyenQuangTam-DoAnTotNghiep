import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { DichVuCaiDatService } from './dich-vu-cai-dat.service';
import {
  soDoCapNhatCaiDat,
  soDoCapNhatMotCaiDat,
  soDoKhoiPhucCaiDat,
  soDoKiemTraKetNoiSmtp,
  CapNhatCaiDatInput,
  CapNhatMotCaiDatInput,
  KhoiPhucCaiDatInput,
  KiemTraKetNoiSmtpInput,
  HanhDong,
  DoiTuong,
  PayloadJwt,
} from '@lms/chung';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { CongKhai } from '../../cot-loi/trang-tri/cong-khai.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';

@ApiTags('Cài đặt Hệ thống')
@Controller('cai-dat')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
export class DieuKhienCaiDatController {
  constructor(private readonly dichVuCaiDat: DichVuCaiDatService) {}

  @Get('cong-khai')
  @CongKhai()
  @ApiOperation({
    summary: 'Lấy bản đồ cấu hình công khai cho trang cổng thông tin, đăng nhập và thanh điều hướng',
  })
  @ApiResponse({ status: 200, description: 'Trả về cấu hình công khai dạng key-value' })
  async layBanDoCaiDatCongKhai() {
    return this.dichVuCaiDat.layBanDoCaiDatCongKhai();
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Lấy toàn bộ danh sách cài đặt hệ thống (Quản trị viên)' })
  @ApiResponse({ status: 200, description: 'Danh sách cài đặt hệ thống đầy đủ (đã che khóa bí mật)' })
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
  async capNhatNhieu(
    @Body(new ZodValidationPipe(soDoCapNhatCaiDat)) duLieu: CapNhatCaiDatInput,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
    @Req() yeuCau?: Request,
  ) {
    return this.dichVuCaiDat.capNhatNhieu(
      duLieu.danhSachCaiDat,
      nguoiDung?.id,
      yeuCau?.ip,
    );
  }

  @Patch(':khoa')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Cập nhật giá trị một cấu hình theo khóa' })
  @ApiResponse({ status: 200, description: 'Cấu hình được cập nhật thành công' })
  async capNhatMot(
    @Param('khoa') khoa: string,
    @Body(new ZodValidationPipe(soDoCapNhatMotCaiDat)) duLieu: CapNhatMotCaiDatInput,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
    @Req() yeuCau?: Request,
  ) {
    return this.dichVuCaiDat.capNhatMot(
      khoa,
      duLieu.giaTri,
      nguoiDung?.id,
      yeuCau?.ip,
    );
  }

  @Post('khoi-phuc-mac-dinh')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Khôi phục cài đặt về mặc định theo nhóm hoặc danh sách khóa' })
  @ApiResponse({ status: 200, description: 'Đã khôi phục cài đặt về mặc định' })
  async khoiPhucMacDinh(
    @Body(new ZodValidationPipe(soDoKhoiPhucCaiDat)) duLieu: KhoiPhucCaiDatInput,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
    @Req() yeuCau?: Request,
  ) {
    return this.dichVuCaiDat.khoiPhucMacDinh(duLieu, nguoiDung?.id, yeuCau?.ip);
  }

  @Post('kiem-tra-smtp')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @ApiOperation({ summary: 'Kiểm tra kết nối tới máy chủ SMTP gửi thư' })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra kết nối SMTP' })
  async kiemTraKetNoiSmtp(
    @Body(new ZodValidationPipe(soDoKiemTraKetNoiSmtp)) duLieu: KiemTraKetNoiSmtpInput,
  ) {
    return this.dichVuCaiDat.kiemTraKetNoiSmtp(duLieu);
  }

  @Post('tai-len-tep')
  @ApiBearerAuth('JWT-auth')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.CaiDatHeThong)
  @UseInterceptors(
    FileInterceptor('tep', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Tải lên hình ảnh thương hiệu (Logo, Favicon, Icon) từ máy tính' })
  @ApiResponse({ status: 200, description: 'Tải lên tệp thương hiệu thành công' })
  async taiLenTepThuongHieu(
    @UploadedFile() tep?: Express.Multer.File,
    @Body('khoa') khoa?: string,
  ) {
    return this.dichVuCaiDat.taiLenTepThuongHieu(tep, khoa);
  }
}
