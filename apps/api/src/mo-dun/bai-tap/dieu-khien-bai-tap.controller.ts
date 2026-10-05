import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DichVuBaiTapService } from './dich-vu-bai-tap.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoBaiTapSchema,
  TaoBaiTapInput,
  chamDiemBaiNopSchema,
  ChamDiemBaiNopInput,
} from '@lms/chung';

@ApiTags('Quản lý Bài tập, Nộp bài & Chấm điểm')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('bai-tap')
export class DieuKhienBaiTapController {
  constructor(private readonly dichVuBaiTap: DichVuBaiTapService) {}

  @Get('lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách bài tập của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiTap)
  async layDanhSachTheoLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.layDanhSachBaiTap(idLop, nguoiDung);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một bài tập' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiTap)
  async layChiTiet(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.layChiTietBaiTap(id, nguoiDung);
  }

  @Post('lop/:idLop')
  @ApiOperation({ summary: 'Giao bài tập mới cho lớp học phần' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaiTap)
  async taoBaiTap(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(taoBaiTapSchema)) duLieu: TaoBaiTapInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.taoBaiTap(idLop, duLieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài tập' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BaiTap)
  async xoaBaiTap(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.xoaBaiTap(id, nguoiDung);
  }

  @Post(':id/nop-bai')
  @ApiOperation({ summary: 'Học sinh nộp bài tập (văn bản hoặc đính kèm tệp)' })
  @ApiConsumes('multipart/form-data')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaiNop)
  @UseInterceptors(
    FileInterceptor('tep', {
      limits: { fileSize: 30 * 1024 * 1024 }, // Tối đa 30MB
    }),
  )
  async nopBaiTap(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('noiDung') noiDung?: string,
    @UploadedFile() tep?: Express.Multer.File,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
  ) {
    return this.dichVuBaiTap.nopBai(id, noiDung, tep, nguoiDung!);
  }

  @Get(':id/danh-sach-nop')
  @ApiOperation({ summary: 'Giáo viên xem danh sách học sinh đã nộp bài' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiTap)
  async layDanhSachNop(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.layDanhSachBaiNop(id, nguoiDung);
  }

  @Post('bai-nop/:idBaiNop/cham-diem')
  @ApiOperation({ summary: 'Giáo viên chấm điểm và nhập nhận xét cho bài nộp' })
  @KiemTraQuyen(HanhDong.ChamDiem, DoiTuong.BaiNop)
  async chamDiem(
    @Param('idBaiNop', ParseUUIDPipe) idBaiNop: string,
    @Body(new ZodValidationPipe(chamDiemBaiNopSchema)) duLieu: ChamDiemBaiNopInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuBaiTap.chamDiem(idBaiNop, duLieu, nguoiDung);
  }
}
