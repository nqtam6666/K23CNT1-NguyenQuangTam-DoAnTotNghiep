import { Module } from '@nestjs/common';
import { DieuKhienHoSo } from './dieu-khien-ho-so.controller';
import { DichVuHoSo } from './dich-vu-ho-so.service';
import { KhoHoSo } from './kho-ho-so.repository';
import { MoDunNguoiDungModule } from '../nguoi-dung/mo-dun-nguoi-dung.module';

@Module({
  imports: [MoDunNguoiDungModule],
  controllers: [DieuKhienHoSo],
  providers: [DichVuHoSo, KhoHoSo],
  exports: [DichVuHoSo, KhoHoSo],
})
export class MoDunHoSoModule {}
