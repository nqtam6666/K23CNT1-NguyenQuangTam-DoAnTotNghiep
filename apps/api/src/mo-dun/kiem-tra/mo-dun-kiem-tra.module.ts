import { Module } from '@nestjs/common';
import { DieuKhienKiemTraController } from './dieu-khien-kiem-tra.controller';
import { DichVuKiemTraService } from './dich-vu-kiem-tra.service';
import { KhoKiemTraRepository } from './kho-kiem-tra.repository';
import { MoDunTroLyAiModule } from '../tro-ly-ai/mo-dun-tro-ly-ai.module';

@Module({
  imports: [MoDunTroLyAiModule],
  controllers: [DieuKhienKiemTraController],
  providers: [DichVuKiemTraService, KhoKiemTraRepository],
  exports: [DichVuKiemTraService, KhoKiemTraRepository],
})
export class MoDunKiemTraModule {}
