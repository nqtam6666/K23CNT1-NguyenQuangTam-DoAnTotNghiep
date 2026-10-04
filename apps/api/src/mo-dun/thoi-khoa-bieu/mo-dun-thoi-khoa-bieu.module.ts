import { Module } from '@nestjs/common';
import { KhoThoiKhoaBieuRepository } from './kho-thoi-khoa-bieu.repository';
import { DichVuThoiKhoaBieuService } from './dich-vu-thoi-khoa-bieu.service';
import { DieuKhienThoiKhoaBieuController } from './dieu-khien-thoi-khoa-bieu.controller';
import { PrismaModule } from '../../cot-loi/csdl/prisma.module';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [PrismaModule, MoDunPhanQuyenModule],
  controllers: [DieuKhienThoiKhoaBieuController],
  providers: [KhoThoiKhoaBieuRepository, DichVuThoiKhoaBieuService],
  exports: [KhoThoiKhoaBieuRepository, DichVuThoiKhoaBieuService],
})
export class MoDunThoiKhoaBieuModule {}
