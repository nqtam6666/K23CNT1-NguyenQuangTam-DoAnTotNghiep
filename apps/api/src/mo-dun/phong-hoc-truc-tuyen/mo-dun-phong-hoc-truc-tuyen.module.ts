import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import { DichVuPhongHoc } from './dich-vu-phong-hoc.service';
import { DieuKhienPhongHoc } from './dieu-khien-phong-hoc.controller';
import { PrismaModule } from '../../cot-loi/csdl/prisma.module';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [ConfigModule, PrismaModule, MoDunPhanQuyenModule],
  controllers: [DieuKhienPhongHoc],
  providers: [KhoPhongHoc, DichVuPhongHoc],
  exports: [KhoPhongHoc, DichVuPhongHoc],
})
export class MoDunPhongHocTrucTuyenModule {}
