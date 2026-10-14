import { Module } from '@nestjs/common';
import { DieuKhienSoDiemController } from './dieu-khien-so-diem.controller';
import { DichVuSoDiemService } from './dich-vu-so-diem.service';
import { KhoSoDiemRepository } from './kho-so-diem.repository';
import { MoDunTroLyAiModule } from '../tro-ly-ai/mo-dun-tro-ly-ai.module';

@Module({
  imports: [MoDunTroLyAiModule],
  controllers: [DieuKhienSoDiemController],
  providers: [DichVuSoDiemService, KhoSoDiemRepository],
  exports: [DichVuSoDiemService, KhoSoDiemRepository],
})
export class MoDunSoDiemModule {}
