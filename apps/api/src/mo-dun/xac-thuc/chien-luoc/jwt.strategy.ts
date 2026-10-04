import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadJwt, MaLoiNghiepVu } from '@lms/chung';
import { KhoNguoiDung } from '../kho-nguoi-dung.repository';

@Injectable()
export class ChienLuocJwt extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly khoNguoiDung: KhoNguoiDung,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (yeuCau) => {
          return yeuCau?.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ||
        'chuoi_bi_mat_access_token_lms_sieu_bao_mat_2026_xyz',
    });
  }

  async validate(payload: PayloadJwt) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(payload.id || payload.sub);
    if (!nguoiDung || !nguoiDung.kichHoat || nguoiDung.ngayXoa) {
      throw new UnauthorizedException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_KHOAN_BI_KHOA,
        thongDiep: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
      });
    }

    return {
      sub: nguoiDung.id,
      id: nguoiDung.id,
      email: nguoiDung.email,
      hoTen: nguoiDung.hoTen,
      vaiTro: nguoiDung.vaiTro,
    };
  }
}
