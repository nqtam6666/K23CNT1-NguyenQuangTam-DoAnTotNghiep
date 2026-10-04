import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PayloadJwt, PhanHoiBangDieuKhien } from '@lms/chung';
import { SoDangKyTienIch } from './so-dang-ky-tien-ich.registry';
import { DichVuBoNhoDem } from './dich-vu-bo-nho-dem.service';
import { TienIchTongQuanProvider } from './cung-cap-tien-ich/tien-ich-tong-quan.provider';
import { TienIchGiaoVuProvider } from './cung-cap-tien-ich/tien-ich-giao-vu.provider';
import { TienIchGiaoVienProvider } from './cung-cap-tien-ich/tien-ich-giao-vien.provider';
import { TienIchHocSinhProvider } from './cung-cap-tien-ich/tien-ich-hoc-sinh.provider';
import { TienIchPhuHuynhProvider } from './cung-cap-tien-ich/tien-ich-phu-huynh.provider';
import { TienIchNhatKyProvider } from './cung-cap-tien-ich/tien-ich-nhat-ky.provider';

@Injectable()
export class DichVuBangDieuKhien implements OnModuleInit {
  private readonly logger = new Logger(DichVuBangDieuKhien.name);

  constructor(
    private readonly soDangKy: SoDangKyTienIch,
    private readonly boNhoDem: DichVuBoNhoDem,
    private readonly providerTongQuan: TienIchTongQuanProvider,
    private readonly providerGiaoVu: TienIchGiaoVuProvider,
    private readonly providerGiaoVien: TienIchGiaoVienProvider,
    private readonly providerHocSinh: TienIchHocSinhProvider,
    private readonly providerPhuHuynh: TienIchPhuHuynhProvider,
    private readonly providerNhatKy: TienIchNhatKyProvider,
  ) {}

  onModuleInit() {
    // Đăng ký toàn bộ các provider vào Registry
    this.soDangKy.dangKy(this.providerTongQuan);
    this.soDangKy.dangKy(this.providerGiaoVu);
    this.soDangKy.dangKy(this.providerGiaoVien);
    this.soDangKy.dangKy(this.providerHocSinh);
    this.soDangKy.dangKy(this.providerPhuHuynh);
    this.soDangKy.dangKy(this.providerNhatKy);
    this.logger.log('Đã nạp toàn bộ 6 Provider tiện ích vào Registry Bảng điều khiển.');
  }

  async layDuLieuBangDieuKhien(nguoiDung: PayloadJwt): Promise<PhanHoiBangDieuKhien> {
    const khoaDem = `bang-dieu-khien:${nguoiDung.vaiTro}:${nguoiDung.id}`;

    // Kiểm tra cache Redis (TTL 60s)
    const duLieuDem = await this.boNhoDem.lay<PhanHoiBangDieuKhien>(khoaDem);
    if (duLieuDem) {
      return duLieuDem;
    }

    // Tổng hợp từ các provider được phân quyền
    const danhSachTienIch = await this.soDangKy.tongHopTienIch(nguoiDung);

    const phanHoi: PhanHoiBangDieuKhien = {
      tienIch: danhSachTienIch,
      thoiGianTao: new Date().toISOString(),
    };

    // Lưu cache Redis 60s
    await this.boNhoDem.luu(khoaDem, phanHoi, 60);

    return phanHoi;
  }
}
