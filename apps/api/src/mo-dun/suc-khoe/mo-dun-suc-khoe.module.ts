import { Module } from '@nestjs/common';
import { DieuKhienSucKhoe } from './dieu-khien-suc-khoe.controller';

@Module({
  controllers: [DieuKhienSucKhoe],
})
export class MoDunSucKhoeModule {}
