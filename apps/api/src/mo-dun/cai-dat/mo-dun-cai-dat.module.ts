import { Global, Module } from '@nestjs/common';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';
import { DichVuCaiDatService } from './dich-vu-cai-dat.service';
import { DieuKhienCaiDatController } from './dieu-khien-cai-dat.controller';

@Global()
@Module({
  controllers: [DieuKhienCaiDatController],
  providers: [KhoCaiDatRepository, DichVuCaiDatService],
  exports: [DichVuCaiDatService, KhoCaiDatRepository],
})
export class MoDunCaiDatModule {}
