import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DieuKhienXacThuc } from './dieu-khien-xac-thuc.controller';
import { DichVuXacThuc } from './dich-vu-xac-thuc.service';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';
import { ChienLuocJwt } from './chien-luoc/jwt.strategy';
import { XacThucJwtGuard } from './ve-si/jwt-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') ||
          'chuoi_bi_mat_access_token_lms_sieu_bao_mat_2026_xyz',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
    }),
  ],
  controllers: [DieuKhienXacThuc],
  providers: [DichVuXacThuc, KhoNguoiDung, ChienLuocJwt, XacThucJwtGuard],
  exports: [DichVuXacThuc, KhoNguoiDung, XacThucJwtGuard, JwtModule],
})
export class MoDunXacThucModule {}
