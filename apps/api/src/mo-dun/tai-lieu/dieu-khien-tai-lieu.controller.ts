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
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  LoaiTaiLieu,
  danhGiaTaiLieuSchema,
  DanhGiaTaiLieuInput,
  khoiPhucPhienBanTaiLieuSchema,
  KhoiPhucPhienBanTaiLieuInput,
} from '@lms/chung';

@ApiTags('Tài liệu học tập, Đánh giá học liệu & Quản lý phiên bản')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('tai-lieu')
export class DieuKhienTaiLieuController {
  constructor(private readonly dichVuTaiLieu: DichVuTaiLieuService) {}

  @Get('lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu học tập kèm điểm đánh giá và số phiên bản của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.TaiLieu)
  async layDanhSachTheoLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.layDanhSachTaiLieu(idLop, nguoiDung);
  }

  @Post('lop/:idLop')
  @ApiOperation({ summary: 'Tải lên tài liệu học tập mới cho lớp học phần (khởi tạo phiên bản v1)' })
  @ApiConsumes('multipart/form-data')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  @UseInterceptors(
    FileInterceptor('tep', {
      limits: { fileSize: 50 * 1024 * 1024 },
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
        loaiTaiLieu: loaiTaiLieu || LoaiTaiLieu.TAI_LIEU_THAM_KHAO,
      },
      tep,
      nguoiDung!,
    );
  }

  @Get(':id/danh-gia')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá sao và nhận xét của học liệu' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.TaiLieu)
  async layDanhSachDanhGia(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.layDanhSachDanhGia(id, nguoiDung);
  }

  @Post(':id/danh-gia')
  @ApiOperation({ summary: 'Gửi hoặc cập nhật đánh giá chất lượng học liệu (1-5 sao kèm nhận xét)' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.TaiLieu)
  async danhGiaTaiLieu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(danhGiaTaiLieuSchema)) duLieu: DanhGiaTaiLieuInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.danhGiaTaiLieu(id, duLieu, nguoiDung);
  }

  @Get(':id/phien-ban')
  @ApiOperation({ summary: 'Lấy lịch sử các phiên bản cập nhật của tài liệu học tập' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.TaiLieu)
  async layLichSuPhienBan(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.layLichSuPhienBan(id, nguoiDung);
  }

  @Post(':id/phien-ban')
  @ApiOperation({ summary: 'Cập nhật phiên bản tệp mới cho tài liệu học tập và lưu vết lịch sử phiên bản' })
  @ApiConsumes('multipart/form-data')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  @UseInterceptors(
    FileInterceptor('tep', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async capNhatPhienBan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ghiChuThayDoi') ghiChuThayDoi: string,
    @Body('tieuDe') tieuDe?: string,
    @Body('moTa') moTa?: string,
    @UploadedFile() tep?: Express.Multer.File,
    @NguoiDungHienTai() nguoiDung?: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.capNhatPhienBanTaiLieu(
      id,
      {
        ghiChuThayDoi: ghiChuThayDoi || 'Cập nhật nội dung bài giảng mới',
        tieuDe,
        moTa,
      },
      tep,
      nguoiDung!,
    );
  }

  @Post(':id/khoi-phuc-phien-ban')
  @ApiOperation({ summary: 'Khôi phục tài liệu học tập về một phiên bản trước đó trong lịch sử' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  async khoiPhucPhienBan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(khoiPhucPhienBanTaiLieuSchema)) duLieu: KhoiPhucPhienBanTaiLieuInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTaiLieu.khoiPhucPhienBan(id, duLieu, nguoiDung);
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
