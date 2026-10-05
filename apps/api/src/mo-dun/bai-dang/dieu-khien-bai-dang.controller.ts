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
import { DichVuBaiDangService } from './dich-vu-bai-dang.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoBaiDangSchema,
  TaoBaiDangInput,
  taoBinhLuanSchema,
  TaoBinhLuanInput,
} from '@lms/chung';

@ApiTags('Bảng tin & Thảo luận Lớp học phần')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('bai-dang')
export class DieuKhienBaiDangController {
  constructor(private readonly dichVuBaiDang: DichVuBaiDangService) {}

  @Get('lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách bài đăng trên bảng tin của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiDang)
  async layDanhSachTheoLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiDang.layDanhSachBaiDang(idLop, nguoiDung);
  }

  @Post('lop/:idLop')
  @ApiOperation({ summary: 'Đăng bài thông báo hoặc bài thảo luận mới lên lớp học phần' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaiDang)
  async taoBaiDang(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(taoBaiDangSchema)) duLieu: TaoBaiDangInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiDang.taoBaiDang(idLop, duLieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài đăng trên bảng tin (chủ sở hữu hoặc giáo viên/admin)' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BaiDang)
  async xoaBaiDang(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiDang.xoaBaiDang(id, nguoiDung);
  }

  @Post(':id/binh-luan')
  @ApiOperation({ summary: 'Thêm bình luận vào bài đăng' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BinhLuan)
  async taoBinhLuan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(taoBinhLuanSchema)) duLieu: TaoBinhLuanInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiDang.taoBinhLuan(id, duLieu, nguoiDung);
  }

  @Delete('binh-luan/:idBinhLuan')
  @ApiOperation({ summary: 'Xóa bình luận' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BinhLuan)
  async xoaBinhLuan(
    @Param('idBinhLuan', ParseUUIDPipe) idBinhLuan: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiDang.xoaBinhLuan(idBinhLuan, nguoiDung);
  }
}
