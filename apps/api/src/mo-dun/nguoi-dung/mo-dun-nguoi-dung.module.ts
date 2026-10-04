import { Module } from '@nestjs/common';
import { DieuKhienNguoiDung } from './dieu-khien-nguoi-dung.controller';
import { DichVuNguoiDung } from './dich-vu-nguoi-dung.service';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';

@Module({
  controllers: [DieuKhienNguoiDung],
  providers: [DichVuNguoiDung, KhoNguoiDung],
  exports: [DichVuNguoiDung, KhoNguoiDung],
})
export class MoDunNguoiDungModule {}
