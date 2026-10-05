import { Module } from '@nestjs/common';
import { DieuKhienTroLyAiController } from './dieu-khien-tro-ly-ai.controller';
import { DichVuTroLyAiService } from './dich-vu-tro-ly-ai.service';
import { KhoTroLyAiRepository } from './kho-tro-ly-ai.repository';
import { DichVuEmbeddingService } from './dich-vu-embedding.service';
import { DichVuLlmService } from './dich-vu-llm.service';
import { MoDunCaiDatModule } from '../cai-dat/mo-dun-cai-dat.module';

@Module({
  imports: [MoDunCaiDatModule],
  controllers: [DieuKhienTroLyAiController],
  providers: [
    DichVuTroLyAiService,
    KhoTroLyAiRepository,
    DichVuEmbeddingService,
    DichVuLlmService,
  ],
  exports: [
    DichVuTroLyAiService,
    KhoTroLyAiRepository,
    DichVuEmbeddingService,
    DichVuLlmService,
  ],
})
export class MoDunTroLyAiModule {}

