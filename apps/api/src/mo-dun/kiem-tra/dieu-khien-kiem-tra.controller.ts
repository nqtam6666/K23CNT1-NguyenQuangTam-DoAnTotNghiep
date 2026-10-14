import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuKiemTraService } from './dich-vu-kiem-tra.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoBaiKiemTraSchema,
  TaoBaiKiemTraInput,
  sinhDeKiemTraAISchema,
  SinhDeKiemTraAIInput,
  nopBaiKiemTraSchema,
  NopBaiKiemTraInput,
  capNhatTrangThaiBaiKiemTraSchema,
  CapNhatTrangThaiBaiKiemTraInput,
} from '@lms/chung';

@ApiTags('Luyện tập & Thi thử thông minh (AI)')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('kiem-tra')
export class DieuKhienKiemTraController {
  constructor(private readonly dichVuKiemTra: DichVuKiemTraService) {}

  @Get('lop/:idLop')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Lấy danh sách đề luyện tập và thi thử của lớp học phần' })
  async layDanhSachTheoLop(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuKiemTra.layDanhSachTheoLop(idLop, nguoiDung);
    return {
      thanhCong: true,
      duLieu,
    };
  }

  @Get(':id')
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Xem chi tiết đề kiểm tra và danh sách câu hỏi' })
  async layChiTiet(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuKiemTra.layChiTietBaiKiemTra(id, nguoiDung);
    return {
      thanhCong: true,
      duLieu,
    };
  }

  @Post('lop/:idLop')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Tạo đề luyện tập / thi thử mới cho lớp học phần' })
  async taoBaiKiemTra(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(taoBaiKiemTraSchema)) duLieu: TaoBaiKiemTraInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuKiemTra.taoBaiKiemTra(idLop, duLieu, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: 'Đã tạo đề kiểm tra thành công',
      duLieu: ketQua,
    };
  }

  @Post('lop/:idLop/sinh-bang-ai')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Sử dụng AI biên soạn tự động đề luyện tập / thi thử từ tài liệu môn học' })
  async sinhDeBangAI(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(sinhDeKiemTraAISchema)) duLieu: SinhDeKiemTraAIInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuKiemTra.sinhDeKiemTraBangAI(idLop, duLieu, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Đã biên soạn thông minh đề "${ketQua.tieuDe}" gồm ${duLieu.soLuongCau} câu hỏi trắc nghiệm`,
      duLieu: ketQua,
    };
  }

  @Post(':id/nop-bai')
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.LuotLamBai)
  @ApiOperation({ summary: 'Nộp bài làm luyện tập / thi thử, chấm điểm tự động và nhận đánh giá AI' })
  async nopBai(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(nopBaiKiemTraSchema)) duLieu: NopBaiKiemTraInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuKiemTra.nopBaiKiemTra(id, duLieu, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: `Nộp bài thành công! Bạn đạt ${ketQua.diemSo} điểm (${ketQua.soCauDung}/${ketQua.tongSoCau} câu đúng).`,
      duLieu: ketQua,
    };
  }

  @Patch(':id/trang-thai')
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Mở hoặc đóng nhận bài làm của đề kiểm tra' })
  async capNhatTrangThai(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatTrangThaiBaiKiemTraSchema))
    duLieu: CapNhatTrangThaiBaiKiemTraInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuKiemTra.capNhatTrangThai(id, duLieu.trangThai, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: 'Đã cập nhật trạng thái đề kiểm tra',
      duLieu: ketQua,
    };
  }

  @Delete(':id')
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.BaiKiemTra)
  @ApiOperation({ summary: 'Xóa đề luyện tập / thi thử' })
  async xoaBaiKiemTra(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    await this.dichVuKiemTra.xoaBaiKiemTra(id, nguoiDung);
    return {
      thanhCong: true,
      thongDiep: 'Đã xóa đề kiểm tra khỏi lớp học phần',
    };
  }
}
