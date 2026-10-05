import { Module } from '@nestjs/common';
import { KhoBaiDangRepository } from './kho-bai-dang.repository';
import { DichVuBaiDangService } from './dich-vu-bai-dang.service';
import { DieuKhienBaiDangController } from './dieu-khien-bai-dang.controller';

@Module({
  controllers: [DieuKhienBaiDangController],
  providers: [KhoBaiDangRepository, DichVuBaiDangService],
  exports: [DichVuBaiDangService],
})
export class MoDunBaiDangModule {}
