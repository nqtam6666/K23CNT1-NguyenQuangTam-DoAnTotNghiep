import { Module } from '@nestjs/common';
import { KhoBaiTapRepository } from './kho-bai-tap.repository';
import { DichVuBaiTapService } from './dich-vu-bai-tap.service';
import { DieuKhienBaiTapController } from './dieu-khien-bai-tap.controller';

@Module({
  controllers: [DieuKhienBaiTapController],
  providers: [KhoBaiTapRepository, DichVuBaiTapService],
  exports: [DichVuBaiTapService],
})
export class MoDunBaiTapModule {}
