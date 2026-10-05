import { Module } from '@nestjs/common';
import { DichVuBaoLoiDongGopService } from './dich-vu-bao-loi-dong-gop.service';
import { KhoBaoLoiDongGopRepository } from './kho-bao-loi-dong-gop.repository';
import { DieuKhienBaoLoiDongGopController } from './dieu-khien-bao-loi-dong-gop.controller';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [MoDunPhanQuyenModule],
  controllers: [DieuKhienBaoLoiDongGopController],
  providers: [DichVuBaoLoiDongGopService, KhoBaoLoiDongGopRepository],
  exports: [DichVuBaoLoiDongGopService, KhoBaoLoiDongGopRepository],
})
export class MoDunBaoLoiDongGopModule {}
