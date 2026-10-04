import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuLopHocPhanService } from './dich-vu-lop-hoc-phan.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  taoLopHocPhanSchema,
  TaoLopHocPhanInput,
  capNhatLopHocPhanSchema,
  CapNhatLopHocPhanInput,
  truyVanLopHocPhanSchema,
  TruyVanLopHocPhanInput,
  ghiDanhHocSinhSchema,
  GhiDanhHocSinhInput,
  ghiDanhNhieuHocSinhSchema,
  GhiDanhNhieuHocSinhInput,
  ghiDanhTheoLopHanhChinhSchema,
  GhiDanhTheoLopHanhChinhInput,
} from '@lms/chung';
import { z } from 'zod';

const thamGiaBangMaSchema = z.object({
  maThamGia: z.string().min(1, 'Mã tham gia không được để trống').trim().toUpperCase(),
});

@ApiTags('Quản lý Lớp học phần & Ghi danh')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('lop-hoc-phan')
export class DieuKhienLopHocPhanController {
  constructor(private readonly dichVuLopHocPhan: DichVuLopHocPhanService) {}

  // ==========================================
  // LỚP HỌC PHẦN
  // ==========================================

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lớp học phần theo vai trò & bộ lọc' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.LopHocPhan)
  async layDanhSach(
    @Query(new ZodValidationPipe(truyVanLopHocPhanSchema)) truyVan: TruyVanLopHocPhanInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuLopHocPhan.layDanhSachLopHocPhan(truyVan, nguoiDung);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết lớp học phần (kiểm tra quyền sở hữu ABAC)' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.LopHocPhan)
  async layChiTiet(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuLopHocPhan.layChiTietLopHocPhan(id, nguoiDung);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo lớp học phần mới (Giáo vụ/Admin)' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.LopHocPhan)
  async taoMoi(@Body(new ZodValidationPipe(taoLopHocPhanSchema)) duLieu: TaoLopHocPhanInput) {
    return this.dichVuLopHocPhan.taoLopHocPhan(duLieu);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin lớp học phần' })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.LopHocPhan)
  async capNhat(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(capNhatLopHocPhanSchema)) duLieu: CapNhatLopHocPhanInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuLopHocPhan.capNhatLopHocPhan(id, duLieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lớp học phần (Giáo vụ/Admin)' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.LopHocPhan)
  async xoa(@Param('id', ParseUUIDPipe) id: string) {
    return this.dichVuLopHocPhan.xoaLopHocPhan(id);
  }

  // ==========================================
  // HỌC SINH TỰ THAM GIA BẰNG MÃ
  // ==========================================

  @Post('tham-gia-bang-ma')
  @ApiOperation({ summary: 'Học sinh tham gia lớp học phần bằng mã mời 6 ký tự' })
  @KiemTraQuyen(HanhDong.ThamGia, DoiTuong.LopHocPhan)
  async thamGiaBangMa(
    @Body(new ZodValidationPipe(thamGiaBangMaSchema)) body: { maThamGia: string },
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuLopHocPhan.thamGiaBangMa(body.maThamGia, nguoiDung);
  }

  // ==========================================
  // GHI DANH HỌC SINH
  // ==========================================

  @Get(':id/ghi-danh')
  @ApiOperation({ summary: 'Lấy danh sách học sinh đã ghi danh vào lớp' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.GhiDanh)
  async layDanhSachGhiDanh(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuLopHocPhan.layDanhSachGhiDanh(id, nguoiDung);
  }

  @Post(':id/ghi-danh')
  @ApiOperation({ summary: 'Ghi danh một học sinh vào lớp học phần' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.GhiDanh)
  async ghiDanhHocSinh(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ghiDanhHocSinhSchema)) duLieu: GhiDanhHocSinhInput,
  ) {
    return this.dichVuLopHocPhan.ghiDanhHocSinh(id, duLieu.idHocSinh);
  }

  @Post(':id/ghi-danh-nhieu')
  @ApiOperation({ summary: 'Ghi danh nhiều học sinh vào lớp học phần' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.GhiDanh)
  async ghiDanhNhieuHocSinh(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ghiDanhNhieuHocSinhSchema)) duLieu: GhiDanhNhieuHocSinhInput,
  ) {
    return this.dichVuLopHocPhan.ghiDanhNhieuHocSinh(id, duLieu.danhSachIdHocSinh);
  }

  @Post(':id/ghi-danh-lop-hanh-chinh')
  @ApiOperation({ summary: 'Ghi danh tất cả học sinh của một lớp hành chính vào lớp học phần' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.GhiDanh)
  async ghiDanhTheoLopHanhChinh(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ghiDanhTheoLopHanhChinhSchema))
    duLieu: GhiDanhTheoLopHanhChinhInput,
  ) {
    return this.dichVuLopHocPhan.ghiDanhTheoLopHanhChinh(id, duLieu.idLopHanhChinh);
  }

  @Delete(':id/ghi-danh/:idHocSinh')
  @ApiOperation({ summary: 'Hủy ghi danh / xóa học sinh khỏi lớp học phần' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.GhiDanh)
  async xoaGhiDanh(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('idHocSinh', ParseUUIDPipe) idHocSinh: string,
  ) {
    return this.dichVuLopHocPhan.xoaGhiDanh(id, idHocSinh);
  }
}
