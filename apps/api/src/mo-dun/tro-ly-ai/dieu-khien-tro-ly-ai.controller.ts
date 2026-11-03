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
  sinhBanNhapTuTaiLieuSchema,
  SinhBanNhapTuTaiLieuInput,
  goiYNhanXetBaiNopSchema,
  GoiYNhanXetBaiNopInput,
  duyetBanNhapAISchema,
  DuyetBanNhapAIInput,
  CauHinhLlm,
} from '@lms/chung';

@ApiTags('Trợ lý học tập & Biên soạn học liệu')
@ApiBearerAuth('JWT-auth')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
@Controller('tro-ly-ai')
export class DieuKhienTroLyAiController {
  constructor(private readonly dichVuTroLyAi: DichVuTroLyAiService) {}

  @Post('kiem-tra-ket-noi')
  @ApiOperation({ summary: 'Kiểm tra kết nối tới dịch vụ mô hình ngôn ngữ đã cấu hình' })
  @KiemTraQuyen(HanhDong.QuanLy, DoiTuong.TatCa)
  async kiemTraKetNoi(@Body() cauHinh?: CauHinhLlm) {
    return this.dichVuTroLyAi.kiemTraKetNoiAI(cauHinh);
  }

  @Get('thong-ke-su-dung')
  @ApiOperation({
    summary: 'Lấy thống kê lưu lượng, hạn mức lượt hỏi mỗi ngày và chi phí sử dụng Trợ lý AI',
  })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.PhienTroLy)
  async layThongKeSuDung(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuTroLyAi.layThongKeSuDungAI(nguoiDung);
  }

  @Get('phien')
  @ApiOperation({ summary: 'Lấy danh sách phiên hội thoại của người dùng' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.PhienTroLy)
  async layDanhSachPhien(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuTroLyAi.layDanhSachPhien(nguoiDung);
  }

  @Get('phien/:id')
  @ApiOperation({ summary: 'Lấy chi tiết lịch sử tin nhắn và trích dẫn trong phiên' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.PhienTroLy)
  async layChiTietPhien(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.layChiTietPhien(id, nguoiDung);
  }

  @Delete('phien')
  @ApiOperation({ summary: 'Xóa toàn bộ lịch sử phiên hội thoại của người dùng hiện tại' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.PhienTroLy)
  async xoaTatCaPhien(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return this.dichVuTroLyAi.xoaTatCaPhien(nguoiDung);
  }

  @Delete('phien/:id')
  @ApiOperation({ summary: 'Xóa một phiên hội thoại' })
  @KiemTraQuyen(HanhDong.Xoa, DoiTuong.PhienTroLy)
  async xoaPhien(
    @Param('id', ParseUUIDPipe) id: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.xoaPhien(id, nguoiDung);
  }

  @Post('hoi-dap')
  @ApiOperation({
    summary: 'Gửi câu hỏi tra cứu học liệu kèm tùy chọn mức độ giải thích và gợi ý ôn tập',
  })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.PhienTroLy)
  async hoiDap(
    @Body(new ZodValidationPipe(guiTinNhanTroLySchema)) duLieu: GuiTinNhanTroLyInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.hoiDap(duLieu, nguoiDung);
  }

  @Post('nap-tai-lieu/:idTaiLieu')
  @ApiOperation({
    summary: 'Xử lý và lập chỉ mục nội dung tài liệu học tập phục vụ tra cứu học thuật',
  })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.TaiLieu)
  async napTaiLieu(
    @Param('idTaiLieu', ParseUUIDPipe) idTaiLieu: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.napTaiLieuVaoKhoVector(idTaiLieu, nguoiDung);
  }

  @Post('ban-nhap')
  @ApiOperation({
    summary: 'Tạo bản nháp học liệu chờ giảng viên phê duyệt',
  })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BanNhapAI)
  async taoBanNhap(
    @Body(new ZodValidationPipe(taoBanNhapAISchema)) duLieu: TaoBanNhapAIInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.taoBanNhapAI(duLieu, nguoiDung);
  }

  @Post('ban-nhap/sinh-tu-tai-lieu')
  @ApiOperation({
    summary: 'Sinh tự động bản nháp (Câu hỏi kiểm tra, Kế hoạch bài giảng, Bài tập) từ tài liệu theo chương và độ khó',
  })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BanNhapAI)
  async sinhBanNhapTuTaiLieu(
    @Body(new ZodValidationPipe(sinhBanNhapTuTaiLieuSchema)) duLieu: SinhBanNhapTuTaiLieuInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.sinhBanNhapTuTaiLieu(duLieu, nguoiDung);
  }

  @Post('ban-nhap/goi-y-nhan-xet-bai-nop')
  @ApiOperation({
    summary: 'Sinh gợi ý nhận xét và điểm đề xuất cho bài nộp của sinh viên',
  })
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.BanNhapAI)
  async goiYNhanXetBaiNop(
    @Body(new ZodValidationPipe(goiYNhanXetBaiNopSchema)) duLieu: GoiYNhanXetBaiNopInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.goiYNhanXetBaiNop(duLieu, nguoiDung);
  }

  @Get('ban-nhap/lop/:idLop')
  @ApiOperation({ summary: 'Lấy danh sách các bản nháp học liệu của lớp học phần' })
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BanNhapAI)
  async layDanhSachBanNhap(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.layDanhSachBanNhapTheoLop(idLop, nguoiDung);
  }

  @Patch('ban-nhap/:id/duyet')
  @ApiOperation({
    summary: 'Giảng viên duyệt hoặc từ chối bản nháp học liệu (Đề kiểm tra / Bài tập / Kế hoạch bài giảng / Nhận xét)',
  })
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.BanNhapAI)
  async duyetBanNhap(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(duyetBanNhapAISchema)) duLieu: DuyetBanNhapAIInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    return this.dichVuTroLyAi.duyetBanNhapAI(id, duLieu, nguoiDung);
  }
}
