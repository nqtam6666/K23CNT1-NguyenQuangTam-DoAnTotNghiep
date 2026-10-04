import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DieuKhienBangDieuKhien } from './dieu-khien-bang-dieu-khien.controller';
import { DichVuBangDieuKhien } from './dich-vu-bang-dieu-khien.service';
import { SoDangKyTienIch } from './so-dang-ky-tien-ich.registry';
import { DichVuBoNhoDem } from './dich-vu-bo-nho-dem.service';
import { TienIchTongQuanProvider } from './cung-cap-tien-ich/tien-ich-tong-quan.provider';
import { TienIchGiaoVuProvider } from './cung-cap-tien-ich/tien-ich-giao-vu.provider';
import { TienIchGiaoVienProvider } from './cung-cap-tien-ich/tien-ich-giao-vien.provider';
import { TienIchHocSinhProvider } from './cung-cap-tien-ich/tien-ich-hoc-sinh.provider';
import { TienIchPhuHuynhProvider } from './cung-cap-tien-ich/tien-ich-phu-huynh.provider';
import { TienIchNhatKyProvider } from './cung-cap-tien-ich/tien-ich-nhat-ky.provider';
import { MoDunPhanQuyenModule } from '../../phan-quyen/mo-dun-phan-quyen.module';

@Module({
  imports: [ConfigModule, MoDunPhanQuyenModule],
  controllers: [DieuKhienBangDieuKhien],
  providers: [
    SoDangKyTienIch,
    DichVuBoNhoDem,
    TienIchTongQuanProvider,
    TienIchGiaoVuProvider,
    TienIchGiaoVienProvider,
    TienIchHocSinhProvider,
    TienIchPhuHuynhProvider,
    TienIchNhatKyProvider,
    DichVuBangDieuKhien,
  ],
  exports: [DichVuBangDieuKhien, SoDangKyTienIch],
})
export class MoDunBangDieuKhien {}
