import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import {
  DangKyDto,
  DangNhapDto,
  DoiMatKhauDto,
  LamMoiTokenDto,
  KetQuaXacThuc,
  MaLoiNghiepVu,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';

@Injectable()
export class DichVuXacThuc {
  constructor(
    private readonly khoNguoiDung: KhoNguoiDung,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Đăng ký tài khoản mới với mật khẩu mã hóa Argon2id
   */
  async dangKy(
    duLieu: DangKyDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    const nguoiDungTonTai = await this.khoNguoiDung.timTheoEmail(duLieu.email);
    if (nguoiDungTonTai) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.EMAIL_DA_TON_TAI,
        thongDiep: 'Địa chỉ email này đã được sử dụng trong hệ thống',
      });
    }

    const matKhauBăm = await argon2.hash(duLieu.matKhau, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const nguoiDungMoi = await this.khoNguoiDung.taoNguoiDung({
      email: duLieu.email,
      matKhau: matKhauBăm,
      hoTen: duLieu.hoTen,
      soDienThoai: duLieu.soDienThoai,
      vaiTro: duLieu.vaiTro || VaiTro.HOC_SINH,
    });

    return this.taoCapToken(nguoiDungMoi.id, nguoiDungMoi.email, nguoiDungMoi.hoTen, nguoiDungMoi.vaiTro as VaiTro, thongTinThietBi, diaChiIp);
  }

  /**
   * Xác thực đăng nhập bằng email và mật khẩu
   */
  async dangNhap(
    duLieu: DangNhapDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    const nguoiDung = await this.khoNguoiDung.timTheoEmail(duLieu.email);
    if (!nguoiDung) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Email hoặc mật khẩu không chính xác',
      });
    }

    if (!nguoiDung.kichHoat || nguoiDung.ngayXoa) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động',
      });
    }

    const khopMatKhau = await argon2.verify(nguoiDung.matKhau, duLieu.matKhau);
    if (!khopMatKhau) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Email hoặc mật khẩu không chính xác',
      });
    }

    return this.taoCapToken(
      nguoiDung.id,
      nguoiDung.email,
      nguoiDung.hoTen,
      nguoiDung.vaiTro as VaiTro,
      thongTinThietBi,
      diaChiIp,
    );
  }

  /**
   * Làm mới Access Token và xoay vòng Refresh Token (Refresh Token Rotation)
   */
  async lamMoiToken(
    duLieu: LamMoiTokenDto,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    let payload: any;
    try {
      payload = this.jwtService.verify(duLieu.refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chuoi_bi_mat_refresh_token_lms_sieu_bao_mat_2026_abc',
      });
    } catch {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TOKEN_KHONG_HOP_LE,
        thongDiep: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ',
      });
    }

    const phien = await this.khoNguoiDung.timPhienTheoId(payload.phienId);
    if (!phien || phien.daThuHoi || new Date() > phien.hetHanLuc) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TOKEN_HET_HAN,
        thongDiep: 'Phiên làm việc đã bị thu hồi hoặc hết hạn',
      });
    }

    // Thu hồi refresh token cũ để chống replay attack
    await this.khoNguoiDung.thuHoiPhien(phien.id);

    const nguoiDung = await this.khoNguoiDung.timTheoId(phien.idNguoiDung);
    if (!nguoiDung || !nguoiDung.kichHoat || nguoiDung.ngayXoa) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: 'Tài khoản không hợp lệ',
      });
    }

    return this.taoCapToken(
      nguoiDung.id,
      nguoiDung.email,
      nguoiDung.hoTen,
      nguoiDung.vaiTro as VaiTro,
      thongTinThietBi,
      diaChiIp,
    );
  }

  /**
   * Đổi mật khẩu tài khoản
   */
  async doiMatKhau(idNguoiDung: string, duLieu: DoiMatKhauDto): Promise<void> {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const khop = await argon2.verify(nguoiDung.matKhau, duLieu.matKhauHienTai);
    if (!khop) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.MAT_KHAU_KHONG_CHINH_XAC,
        thongDiep: 'Mật khẩu hiện tại không chính xác',
      });
    }

    const matKhauMoiBăm = await argon2.hash(duLieu.matKhauMoi, {
      type: argon2.argon2id,
    });

    await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {
      matKhau: matKhauMoiBăm,
    });

    // Thu hồi toàn bộ phiên đăng nhập cũ sau khi đổi mật khẩu thành công
    await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(idNguoiDung);
  }

  /**
   * Sinh cặp JWT Access Token và Refresh Token
   */
  private async taoCapToken(
    idNguoiDung: string,
    email: string,
    hoTen: string,
    vaiTro: VaiTro,
    thongTinThietBi?: string,
    diaChiIp?: string,
  ): Promise<KetQuaXacThuc> {
    const payload: PayloadJwt = {
      sub: idNguoiDung,
      id: idNguoiDung,
      email,
      hoTen,
      vaiTro,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'chuoi_bi_mat_access_token_lms_sieu_bao_mat_2026_xyz',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const hetHanLuc = new Date();
    hetHanLuc.setDate(hetHanLuc.getDate() + 7); // 7 ngày

    const phienMoi = await this.khoNguoiDung.taoPhienDangNhap({
      nguoiDung: { connect: { id: idNguoiDung } },
      refreshTokenHash: 'dang_sinh',
      thongTinThietBi,
      diaChiIp,
      hetHanLuc,
    });

    const refreshToken = this.jwtService.sign(
      { phienId: phienMoi.id, idNguoiDung },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'chuoi_bi_mat_refresh_token_lms_sieu_bao_mat_2026_abc',
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
      },
    );

    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {});

    return {
      accessToken,
      refreshToken,
      nguoiDung: {
        id: idNguoiDung,
        email,
        hoTen,
        vaiTro,
      },
    };
  }
}
