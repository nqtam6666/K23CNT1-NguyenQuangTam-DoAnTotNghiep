import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './cot-loi/csdl/prisma.module';
import { BoLocNgoaiLeToanCuc } from './cot-loi/bo-loc/bo-loc-ngoai-le-toan-cuc';
import { DinhDangPhanHoiInterceptor } from './cot-loi/danh-chan/dinh-dang-phan-hoi.interceptor';
import { MoDunPhanQuyenModule } from './phan-quyen/mo-dun-phan-quyen.module';
import { PhanQuyenCaslGuard } from './phan-quyen/phan-quyen-casl.guard';
import { MoDunXacThucModule } from './mo-dun/xac-thuc/mo-dun-xac-thuc.module';
import { XacThucJwtGuard } from './mo-dun/xac-thuc/ve-si/jwt-auth.guard';
import { MoDunSucKhoeModule } from './mo-dun/suc-khoe/mo-dun-suc-khoe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    MoDunPhanQuyenModule,
    MoDunXacThucModule,
    MoDunSucKhoeModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BoLocNgoaiLeToanCuc,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DinhDangPhanHoiInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: XacThucJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PhanQuyenCaslGuard,
    },
  ],
})
export class AppModule {}
