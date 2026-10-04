import { Module } from '@nestjs/common';
import { KhoLopHocPhanRepository } from './kho-lop-hoc-phan.repository';
import { DichVuLopHocPhanService } from './dich-vu-lop-hoc-phan.service';
import { DieuKhienLopHocPhanController } from './dieu-khien-lop-hoc-phan.controller';
import { PrismaModule } from '../../cot-loi/csdl/prisma.module';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [PrismaModule, MoDunPhanQuyenModule],
  controllers: [DieuKhienLopHocPhanController],
  providers: [KhoLopHocPhanRepository, DichVuLopHocPhanService],
  exports: [KhoLopHocPhanRepository, DichVuLopHocPhanService],
})
export class MoDunLopHocPhanModule {}
