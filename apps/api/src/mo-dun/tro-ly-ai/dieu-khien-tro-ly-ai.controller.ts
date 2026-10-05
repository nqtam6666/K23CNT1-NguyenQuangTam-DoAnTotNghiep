import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DichVuTroLyAiService } from './dich-vu-tro-ly-ai.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  guiTinNhanTroLySchema,
  GuiTinNhanTroLyInput,
  taoBanNhapAISchema,
  TaoBanNhapAIInput,
  duyetBanNhapAISchema,
  DuyetBanNhapAIInput,
} from '@lms/chung';

@ApiTags('Trợ lý AI & Tìm kiếm tri thức RAG (pgvector)')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('tro-ly-ai')
export class DieuKhienTroLyAiController {
  constructor(private readonly dichVuTroLyAi: DichVuTroLyAiService) {}

  // ==========================================
  // HỎI ĐÁP RAG & PHIÊN TRÒ CHUYỆN
  // ==========================================

  @Post('hoi-dap')
  @ApiOperation({ summary: 'Gửi câu hỏi tới Trợ lý AI (Truy hồi tài liệu có lọc quyền Pre-filtering)' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.PhienTroLy)
  async hoiDap(
    @Body(new ZodValidationPipe(guiTinNhanTroLySchema)) duLieu: GuiTinNhanTroLyInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.hoiDap(duLieu, nguoiDung);
  }

  @Get('phien')
  @ApiOperation({ summary: 'Lấy danh sách các phiên trò chuyện của người dùng' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.PhienTroLy)
  async layDanhSachPhien(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuTroLyAi.layDanhSachPhien(nguoiDung);
  }

  @Get('phien/:id')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của một phiên trò chuyện' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.PhienTroLy)
  async layChiTietPhien(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.layChiTietPhien(id, nguoiDung);
  }

  @Delete('phien/:id')
  @ApiOperation({ summary: 'Xóa một phiên trò chuyện' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.PhienTroLy)
  async xoaPhien(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.xoaPhien(id, nguoiDung);
  }

  // ==========================================
  // NẠP TÀI LIỆU VÀO PGVECTOR
  // ==========================================

  @Post('nap-tai-lieu/:idTaiLieu')
  @ApiOperation({ summary: 'Nạp và phân tích tài liệu môn học vào không gian vector pgvector' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  async napTaiLieu(
    @Param('idTaiLieu', ParseUUIDPipe) idTaiLieu: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.napTaiLieuVaoKhoVector(idTaiLieu, nguoiDung);
  }

  // ==========================================
  // BẢN NHÁP AI (HUMAN-IN-THE-LOOP)
  // ==========================================

  @Post('ban-nhap')
  @ApiOperation({ summary: 'Tạo bản nháp nội dung gợi ý từ AI (chỉ tạo bản nháp theo Rule 04)' })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BanNhapAI)
  async taoBanNhap(
    @Body(new ZodValidationPipe(taoBanNhapAISchema)) duLieu: TaoBanNhapAIInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.taoBanNhapAI(duLieu, nguoiDung);
  }

  @Get('ban-nhap/lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách bản nháp AI của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BanNhapAI)
  async layDanhSachBanNhap(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.layDanhSachBanNhapTheoLop(idLop, nguoiDung);
  }

  @Patch('ban-nhap/:id/duyet')
  @ApiOperation({ summary: 'Giáo viên phê duyệt / từ chối bản nháp AI (Human-in-the-loop)' })
  @KiemTraQuyen(HanhDong.Duyet, DoiTuong.BanNhapAI)
  async duyetBanNhap(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(duyetBanNhapAISchema)) duLieu: DuyetBanNhapAIInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.duyetBanNhapAI(id, duLieu, nguoiDung);
  }
}
