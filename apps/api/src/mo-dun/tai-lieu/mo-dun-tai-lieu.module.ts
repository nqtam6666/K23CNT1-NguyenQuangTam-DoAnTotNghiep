import { Module } from '@nestjs/common';
import { KhoTaiLieuRepository } from './kho-tai-lieu.repository';
import { DichVuTaiLieuService } from './dich-vu-tai-lieu.service';
import { DieuKhienTaiLieuController } from './dieu-khien-tai-lieu.controller';

@Module({
  controllers: [DieuKhienTaiLieuController],
  providers: [KhoTaiLieuRepository, DichVuTaiLieuService],
  exports: [DichVuTaiLieuService],
})
export class MoDunTaiLieuModule {}
