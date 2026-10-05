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
import { DichVuTaiLieuService } from './dich-vu-tai-lieu.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  LoaiTaiLieu,
} from '@lms/chung';

@ApiTags('Tài liệu học tập & Bài giảng')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('tai-lieu')
export class DieuKhienTaiLieuController {
  constructor(private readonly dichVuTaiLieu: DichVuTaiLieuService) {}

  @Get('lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu học tập của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.TaiLieu)
  async layDanhSachTheoLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.layDanhSachTaiLieu(idLop, nguoiDung);
  }

  @Post('lop/:idLop')
  @ApiOperation({ summary: 'Tải lên tài liệu học tập mới cho lớp học phần' })
  @ApiConsumes('multipart/form-data')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  @UseInterceptors(
    FileInterceptor('tep', {
      limits: { fileSize: 50 * 1024 * 1024 }, // Tối đa 50MB
    }),
  )
  async taiLenTaiLieu(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body('tieuDe') tieuDe: string,
    @Body('moTa') moTa?: string,
    @Body('loaiTaiLieu') loaiTaiLieu?: LoaiTaiLieu,
    @UploadedFile() tep?: Express.Multer.File,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.taiLenTaiLieu(
      idLop,
      {
        tieuDe,
        moTa,
        loaiTaiLieu,
      },
      tep,
      nguoiDung!,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài liệu học tập' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.TaiLieu)
  async xoaTaiLieu(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.xoaTaiLieu(id, nguoiDung);
  }
}
