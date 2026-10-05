import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuBaoLoiDongGopService } from './dich-vu-bao-loi-dong-gop.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoBaoLoiDongGopSchema,
  TaoBaoLoiDongGopInput,
  xuLyBaoLoiDongGopSchema,
  XuLyBaoLoiDongGopInput,
  boLocBaoLoiDongGopSchema,
  BoLocBaoLoiDongGopInput,
} from '@lms/chung';

@ApiTags('Báo lỗi & Đóng góp ý kiến')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('bao-loi-dong-gop')
export class DieuKhienBaoLoiDongGopController {
  constructor(
    private readonly dichVuBaoLoi: DichVuBaoLoiDongGopService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Gửi báo lỗi hoặc đóng góp ý kiến mới' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaoLoiDongGop)
  async taoBaoLoi(
    @Body(new ZodValidationPipe(taoBaoLoiDongGopSchema)) duLieu: TaoBaoLoiDongGopInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaoLoi.taoBaoLoi(duLieu, nguoiDung);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo lỗi / đóng góp (có phân trang & lọc)' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaoLoiDongGop)
  async layDanhSach(
    @Query(new ZodValidationPipe(boLocBaoLoiDongGopSchema)) boLoc: BoLocBaoLoiDongGopInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaoLoi.layDanhSach(boLoc, nguoiDung);
  }

  @Get('thong-ke')
  @ApiOperation({ summary: 'Lấy số liệu thống kê báo lỗi / đóng góp theo trạng thái' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaoLoiDongGop)
  async layThongKe(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuBaoLoi.layThongKe(nguoiDung);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một bản ghi báo lỗi / đóng góp' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaoLoiDongGop)
  async layChiTiet(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaoLoi.layChiTiet(id, nguoiDung);
  }

  @Patch(':id/xu-ly')
  @ApiOperation({ summary: 'Cập nhật trạng thái và phản hồi xử lý (Quản trị viên)' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.BaoLoiDongGop)
  async xuLyBaoLoi(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(xuLyBaoLoiDongGopSchema)) duLieu: XuLyBaoLoiDongGopInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaoLoi.xuLyBaoLoi(id, duLieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bản ghi báo lỗi / đóng góp' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BaoLoiDongGop)
  async xoa(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaoLoi.xoa(id, nguoiDung);
  }
}
