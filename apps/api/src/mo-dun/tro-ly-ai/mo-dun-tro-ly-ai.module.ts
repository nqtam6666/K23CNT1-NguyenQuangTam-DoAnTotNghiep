import { Module } from '@nestjs/common';
import { DieuKhienTroLyAiController } from './dieu-khien-tro-ly-ai.controller';
import { DichVuTroLyAiService } from './dich-vu-tro-ly-ai.service';
import { KhoTroLyAiRepository } from './kho-tro-ly-ai.repository';
import { DichVuEmbeddingService } from './dich-vu-embedding.service';

@Module({
  controllers: [DieuKhienTroLyAiController],
  providers: [
    DichVuTroLyAiService,
    KhoTroLyAiRepository,
    DichVuEmbeddingService,
  ],
  exports: [
    DichVuTroLyAiService,
    KhoTroLyAiRepository,
    DichVuEmbeddingService,
  ],
})
export class MoDunTroLyAiModule {}
