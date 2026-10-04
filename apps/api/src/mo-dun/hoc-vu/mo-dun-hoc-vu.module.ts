import { Module } from '@nestjs/common';
import { KhoHocVuRepository } from './kho-hoc-vu.repository';
import { DichVuHocVuService } from './dich-vu-hoc-vu.service';
import { DieuKhienHocVuController } from './dieu-khien-hoc-vu.controller';
import { PrismaModule } from '../../cot-loi/csdl/prisma.module';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [PrismaModule, MoDunPhanQuyenModule],
  controllers: [DieuKhienHocVuController],
  providers: [KhoHocVuRepository, DichVuHocVuService],
  exports: [KhoHocVuRepository, DichVuHocVuService],
})
export class MoDunHocVuModule {}
