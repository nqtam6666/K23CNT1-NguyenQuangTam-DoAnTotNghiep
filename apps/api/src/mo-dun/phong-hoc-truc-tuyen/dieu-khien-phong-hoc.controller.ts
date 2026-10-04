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
import {
  HanhDong,
  DoiTuong,
  PayloadJwt,
  TrangThaiDiemDanh,
} from '@lms/chung';

@ApiTags('Phòng học trực tuyến & LiveKit')
@Controller('phong-hoc-truc-tuyen')
export class DieuKhienPhongHoc {
  constructor(private readonly dichVuPhongHoc: DichVuPhongHoc) {}

  /**
   * Cấp AccessToken ngắn hạn tham gia phòng học trực tuyến LiveKit
   * Kiểm tra quyền chống IDOR (chỉ thành viên lớp mới được cấp)
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
    const duLieu = await this.dichVuPhongHoc.taoTokenTruyCap(
      idLop,
      nguoiDung,
      idBuoiHoc,
    );

    return {
      thanhCong: true,
      thongDiep: 'Cấp token LiveKit phòng học thành công',
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
    const phong = await this.dichVuPhongHoc.batTatPhongHoc(
      idLop,
      dangMo,
      nguoiDung,
    );

    return {
      thanhCong: true,
      thongDiep: dangMo ? 'Đã mở phòng học trực tuyến' : 'Đã đóng phòng học',
      duLieu: phong,
    };
  }

  /**
   * Endpoint nhận Webhook tự động từ LiveKit Server
   * Xác thực chữ ký số bằng WebhookReceiver của LiveKit SDK
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Nhận sự kiện Webhook từ LiveKit Server' })
  async nhanWebhookLiveKit(
    @Headers('authorization') authHeader: string,
    @Req() req: Request,
  ) {
    // Lấy raw body hoặc stringified body
    const bodyRaw =
      typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body);

    const ketQua = await this.dichVuPhongHoc.xuLyWebhook(authHeader || '', bodyRaw);

    return ketQua;
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
    const duLieu = await this.dichVuPhongHoc.layBaoCaoBuoiHoc(
      idLop,
      idBuoiHoc,
      nguoiDung,
    );

    return {
      thanhCong: true,
      duLieu,
    };
  }

  /**
   * Điểm danh thủ công (Dành cho giáo viên chỉnh sửa trạng thái điểm danh)
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
}
