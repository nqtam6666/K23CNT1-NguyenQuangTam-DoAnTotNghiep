import { Global, Module } from '@nestjs/common';
import { NhaMayQuyenHan } from './nha-may-quyen-han.factory';
import { PhanQuyenCaslGuard } from './phan-quyen-casl.guard';

@Global()
@Module({
  providers: [NhaMayQuyenHan, PhanQuyenCaslGuard],
  exports: [NhaMayQuyenHan, PhanQuyenCaslGuard],
})
export class MoDunPhanQuyenModule {}
