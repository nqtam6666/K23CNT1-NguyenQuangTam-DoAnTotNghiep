import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DichVuXacThuc } from './dich-vu-xac-thuc.service';
import {
  dangKySchema,
  dangNhapSchema,
  lamMoiTokenSchema,
  doiMatKhauSchema,
  DangKyDto,
  DangNhapDto,
  LamMoiTokenDto,
  DoiMatKhauDto,
  PayloadJwt,
} from '@lms/chung';
import { ZodValidationPipe } from '../../cot-loi/duong-ong/zod-validation.pipe';
import { CongKhai } from '../../cot-loi/trang-tri/cong-khai.decorator';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { XacThucJwtGuard } from './ve-si/jwt-auth.guard';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';

@ApiTags('Xác thực & Tài khoản')
@Controller('xac-thuc')
@UseGuards(XacThucJwtGuard, PhanQuyenCaslGuard)
export class DieuKhienXacThuc {
  constructor(private readonly dichVuXacThuc: DichVuXacThuc) {}

  @CongKhai()
  @Post('dang-ky')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký tài khoản thành công' })
  async dangKy(
    @Body(new ZodValidationPipe(dangKySchema)) duLieu: DangKyDto,
    @Req() yeuCau: Request,
    @Res({ passthrough: true }) phanHoi: Response,
  ) {
    const thongTinThietBi = yeuCau.headers['user-agent'];
    const diaChiIp = yeuCau.ip;

    const ketQua = await this.dichVuXacThuc.dangKy(duLieu, thongTinThietBi, diaChiIp);
    this.datCookieToken(phanHoi, ketQua.accessToken, ketQua.refreshToken);
    return ketQua;
  }

  @CongKhai()
  @Post('dang-nhap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống LMS' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  async dangNhap(
    @Body(new ZodValidationPipe(dangNhapSchema)) duLieu: DangNhapDto,
    @Req() yeuCau: Request,
    @Res({ passthrough: true }) phanHoi: Response,
  ) {
    const thongTinThietBi = yeuCau.headers['user-agent'];
    const diaChiIp = yeuCau.ip;

    const ketQua = await this.dichVuXacThuc.dangNhap(duLieu, thongTinThietBi, diaChiIp);
    this.datCookieToken(phanHoi, ketQua.accessToken, ketQua.refreshToken);
    return ketQua;
  }

  @CongKhai()
  @Post('lam-moi-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token bằng Refresh Token' })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công' })
  async lamMoiToken(
    @Body(new ZodValidationPipe(lamMoiTokenSchema)) duLieu: LamMoiTokenDto,
    @Req() yeuCau: Request,
    @Res({ passthrough: true }) phanHoi: Response,
  ) {
    const thongTinThietBi = yeuCau.headers['user-agent'];
    const diaChiIp = yeuCau.ip;

    const ketQua = await this.dichVuXacThuc.lamMoiToken(duLieu, thongTinThietBi, diaChiIp);
    this.datCookieToken(phanHoi, ketQua.accessToken, ketQua.refreshToken);
    return ketQua;
  }

  @Post('dang-xuat')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async dangXuat(@Res({ passthrough: true }) phanHoi: Response) {
    phanHoi.clearCookie('access_token');
    phanHoi.clearCookie('refresh_token');
    return { thongDiep: 'Đăng xuất thành công' };
  }

  @Get('ho-so-hien-tai')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin hồ sơ hiện tại' })
  async layHoSoHienTai(@NguoiDungHienTai() nguoiDung: PayloadJwt) {
    return nguoiDung;
  }

  @Post('doi-mat-khau')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu người dùng' })
  @ApiResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  async doiMatKhau(
    @NguoiDungHienTai('id') idNguoiDung: string,
    @Body(new ZodValidationPipe(doiMatKhauSchema)) duLieu: DoiMatKhauDto,
  ) {
    await this.dichVuXacThuc.doiMatKhau(idNguoiDung, duLieu);
    return { thongDiep: 'Đổi mật khẩu thành công' };
  }

  private datCookieToken(phanHoi: Response, accessToken: string, refreshToken: string) {
    const laMoiTruongProduction = process.env.NODE_ENV === 'production';

    phanHoi.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: laMoiTruongProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    phanHoi.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: laMoiTruongProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
  }
}
