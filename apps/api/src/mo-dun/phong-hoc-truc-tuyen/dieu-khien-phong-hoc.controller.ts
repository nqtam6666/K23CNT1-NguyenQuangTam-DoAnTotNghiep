import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Headers,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { DichVuPhongHoc } from './dich-vu-phong-hoc.service';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { KiemTraQuyen } from '../../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  TrangThaiDiemDanh,
  taoMaDiemDanhSchema,
  TaoMaDiemDanhInput,
  diemDanhBangMaSchema,
  DiemDanhBangMaInput,
  diemDanhHangLoatSchema,
  DiemDanhHangLoatInput,
  taoDonXinNghiSchema,
  TaoDonXinNghiInput,
  duyetDonXinNghiSchema,
  DuyetDonXinNghiInput,
} from '@lms/chung';

@ApiTags('Phòng học trực tuyến & Điểm danh thông minh')
@Controller('phong-hoc-truc-tuyen')
export class DieuKhienPhongHoc {
  constructor(private readonly dichVuPhongHoc: DichVuPhongHoc) {}

  /**
   * Cấp AccessToken ngắn hạn tham gia phòng học trực tuyến LiveKit
   */
  @Post('lop/:idLop/token')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.ThamGia, DoiTuong.PhongTrucTuyen)
  @ApiOperation({ summary: 'Cấp token LiveKit tham gia phòng học trực tuyến' })
  async layTokenPhongHoc(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body('idBuoiHoc') idBuoiHoc: string | undefined,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuPhongHoc.taoTokenTruyCap(idLop, nguoiDung, idBuoiHoc);

    return {
      thanhCong: true,
      thongDiep: 'Cấp token phòng học trực tuyến thành công',
      duLieu,
    };
  }

  /**
   * Bật / Tắt trạng thái mở phòng học (Chỉ Giáo viên phụ trách hoặc Giáo vụ/Admin)
   */
  @Patch('lop/:idLop/trang-thai')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Sua, DoiTuong.PhongTrucTuyen)
  @ApiOperation({ summary: 'Mở hoặc đóng phòng học trực tuyến' })
  async batTatPhongHoc(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body('dangMo') dangMo: boolean,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const phong = await this.dichVuPhongHoc.batTatPhongHoc(idLop, dangMo, nguoiDung);

    return {
      thanhCong: true,
      thongDiep: dangMo ? 'Đã mở phòng học trực tuyến' : 'Đã đóng phòng học',
      duLieu: phong,
    };
  }

  /**
   * Endpoint nhận Webhook tự động từ LiveKit Server
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Nhận sự kiện Webhook từ LiveKit Server' })
  async nhanWebhookLiveKit(@Headers('authorization') authHeader: string, @Req() req: Request) {
    const bodyRaw =
      typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body);

    return this.dichVuPhongHoc.xuLyWebhook(authHeader || '', bodyRaw);
  }

  /**
   * Lấy báo cáo nhật ký tham gia và bảng điểm danh của buổi học
   */
  @Get('lop/:idLop/buoi-hoc/:idBuoiHoc/bao-cao')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.NhatKyThamGia)
  @ApiOperation({ summary: 'Xem báo cáo điểm danh và nhật ký tham gia buổi học' })
  async layBaoCaoBuoiHoc(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuPhongHoc.layBaoCaoBuoiHoc(idLop, idBuoiHoc, nguoiDung);

    return {
      thanhCong: true,
      duLieu,
    };
  }

  /**
   * Điểm danh thủ công từng học sinh
   */
  @Post('buoi-hoc/:idBuoiHoc/diem-danh')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Điểm danh hoặc cập nhật trạng thái điểm danh thủ công' })
  async diemDanhThuCong(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @Body('idHocSinh') idHocSinh: string,
    @Body('trangThai') trangThai: TrangThaiDiemDanh,
    @Body('ghiChu') ghiChu?: string,
  ) {
    const ketQua = await this.dichVuPhongHoc.diemDanhThuCong(
      idBuoiHoc,
      idHocSinh,
      trangThai,
      ghiChu,
    );

    return {
      thanhCong: true,
      thongDiep: 'Cập nhật điểm danh thành công',
      duLieu: ketQua,
    };
  }

  /**
   * Điểm danh hàng loạt cả lớp học phần
   */
  @Post('buoi-hoc/:idBuoiHoc/diem-danh-hang-loat')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Lưu điểm danh hàng loạt cho toàn bộ lớp học' })
  async diemDanhHangLoat(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @Body(new ZodValidationPipe(diemDanhHangLoatSchema)) duLieu: DiemDanhHangLoatInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.diemDanhHangLoat(
      idBuoiHoc,
      duLieu.danhSachDiemDanh,
      nguoiDung,
    );

    return {
      thanhCong: true,
      thongDiep: `Đã lưu điểm danh cho ${ketQua.soLuongCapNhat} học sinh`,
      duLieu: ketQua,
    };
  }

  /**
   * Giáo viên mở mã điểm danh thông minh (PIN 6 chữ số có thời hạn)
   */
  @Post('buoi-hoc/:idBuoiHoc/mo-ma-diem-danh')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Mở phiên điểm danh thông minh bằng mã số có thời hạn' })
  async moMaDiemDanh(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @Body(new ZodValidationPipe(taoMaDiemDanhSchema)) duLieu: TaoMaDiemDanhInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.moMaDiemDanhThongMinh(
      idBuoiHoc,
      duLieu.thoiHanPhut,
      nguoiDung,
    );

    return {
      thanhCong: true,
      thongDiep: `Đã mở mã điểm danh thông minh (${ketQua.maDiemDanh}) trong ${duLieu.thoiHanPhut} phút`,
      duLieu: ketQua,
    };
  }

  /**
   * Giáo viên đóng phiên mã điểm danh thông minh
   */
  @Post('buoi-hoc/:idBuoiHoc/dong-ma-diem-danh')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Đóng phiên mã điểm danh thông minh' })
  async dongMaDiemDanh(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.dongMaDiemDanhThongMinh(idBuoiHoc, nguoiDung);

    return {
      thanhCong: true,
      thongDiep: 'Đã đóng mã điểm danh của buổi học',
      duLieu: ketQua,
    };
  }

  /**
   * Học sinh tự điểm danh bằng mã PIN thông minh
   */
  @Post('buoi-hoc/:idBuoiHoc/diem-danh-ma')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Học sinh tự điểm danh bằng mã phiên thông minh' })
  async diemDanhBangMa(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @Body(new ZodValidationPipe(diemDanhBangMaSchema)) duLieu: DiemDanhBangMaInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.diemDanhBangMaThongMinh(
      idBuoiHoc,
      duLieu.maDiemDanh,
      nguoiDung,
    );

    return {
      thanhCong: true,
      thongDiep: 'Điểm danh thành công! Hệ thống đã ghi nhận bạn có mặt.',
      duLieu: ketQua,
    };
  }

  /**
   * Đồng bộ tự động điểm danh thông minh từ dữ liệu tham gia phòng học trực tuyến
   */
  @Post('buoi-hoc/:idBuoiHoc/dong-bo-thong-minh')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Đồng bộ tự động điểm danh từ thời lượng phòng học trực tuyến và đơn nghỉ phép' })
  async dongBoDiemDanhThongMinh(
    @Param('idBuoiHoc', ParseUUIDPipe) idBuoiHoc: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.dongBoDiemDanhThongMinh(idBuoiHoc, nguoiDung);

    return {
      thanhCong: true,
      thongDiep: 'Đã đồng bộ điểm danh tự động từ dữ liệu phiên học và đơn xin nghỉ',
      duLieu: ketQua,
    };
  }

  /**
   * Lấy thống kê chuyên cần toàn lớp học phần và cảnh báo học vụ
   */
  @Get('lop/:idLop/thong-ke-chuyen-can')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.BanGhiDiemDanh)
  @ApiOperation({ summary: 'Thống kê chuyên cần toàn lớp học phần và cảnh báo nguy cơ cấm thi' })
  async layThongKeChuyenCan(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuPhongHoc.layThongKeChuyenCanLop(idLop, nguoiDung);

    return {
      thanhCong: true,
      duLieu,
    };
  }

  /**
   * Gửi đơn xin nghỉ phép cho buổi học
   */
  @Post('lop/:idLop/don-xin-nghi')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Tao, DoiTuong.DonXinNghi)
  @ApiOperation({ summary: 'Học sinh / Phụ huynh gửi đơn xin nghỉ phép' })
  async guiDonXinNghi(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @Body(new ZodValidationPipe(taoDonXinNghiSchema)) duLieu: TaoDonXinNghiInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.guiDonXinNghi(idLop, duLieu, nguoiDung);

    return {
      thanhCong: true,
      thongDiep: 'Đã gửi đơn xin nghỉ phép tới giảng viên phụ trách',
      duLieu: ketQua,
    };
  }

  /**
   * Lấy danh sách đơn xin nghỉ phép của lớp học phần
   */
  @Get('lop/:idLop/don-xin-nghi')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Doc, DoiTuong.DonXinNghi)
  @ApiOperation({ summary: 'Xem danh sách đơn xin nghỉ phép của lớp học phần' })
  async layDanhSachDonXinNghi(
    @Param('idLop', ParseUUIDPipe) idLop: string,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const duLieu = await this.dichVuPhongHoc.layDanhSachDonXinNghi(idLop, nguoiDung);

    return {
      thanhCong: true,
      duLieu,
    };
  }

  /**
   * Giáo viên phê duyệt hoặc từ chối đơn xin nghỉ phép
   */
  @Patch('don-xin-nghi/:idDon/duyet')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
  @KiemTraQuyen(HanhDong.Duyet, DoiTuong.DonXinNghi)
  @ApiOperation({ summary: 'Giáo viên duyệt hoặc từ chối đơn xin nghỉ phép' })
  async duyetDonXinNghi(
    @Param('idDon', ParseUUIDPipe) idDon: string,
    @Body(new ZodValidationPipe(duyetDonXinNghiSchema)) duLieu: DuyetDonXinNghiInput,
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ) {
    const ketQua = await this.dichVuPhongHoc.duyetDonXinNghi(idDon, duLieu, nguoiDung);

    return {
      thanhCong: true,
      thongDiep:
        duLieu.trangThai === 'DA_DUYET'
          ? 'Đã chấp thuận đơn xin nghỉ phép và cập nhật điểm danh vắng có phép'
          : 'Đã từ chối đơn xin nghỉ phép',
      duLieu: ketQua,
    };
  }
}

