import { Injectable, Logger } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien } from '@lms/chung';

export interface NhaCungCapTienIch {
  id: string;
  vaiTroPhuHop(vaiTro: VaiTro): boolean;
  cungCapTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]>;
}

@Injectable()
export class SoDangKyTienIch {
  private readonly logger = new Logger(SoDangKyTienIch.name);
  private readonly danhSachNhaCungCap: NhaCungCapTienIch[] = [];

  dangKy(nhaCungCap: NhaCungCapTienIch): void {
    this.danhSachNhaCungCap.push(nhaCungCap);
    this.logger.log(`Đã đăng ký nhà cung cấp tiện ích: [${nhaCungCap.id}]`);
  }

  async tongHopTienIch(nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const nhaCungCapHopLe = this.danhSachNhaCungCap.filter((ncc) =>
      ncc.vaiTroPhuHop(nguoiDung.vaiTro as VaiTro),
    );

    const danhSachTienIch: TienIchBangDieuKhien[] = [];

    // Sử dụng Promise.allSettled để đảm bảo lỗi của một provider không làm sập toàn trang
    const ketQuaXuLy = await Promise.allSettled(
      nhaCungCapHopLe.map((ncc) =>
        ncc.cungCapTienIch(nguoiDung).catch((loi) => {
          this.logger.error(`Lỗi từ nhà cung cấp [${ncc.id}]: ${loi.message}`, loi.stack);
          throw loi;
        }),
      ),
    );

    ketQuaXuLy.forEach((ketQua, viTri) => {
      const nhaCungCap = nhaCungCapHopLe[viTri];
      if (ketQua.status === 'fulfilled') {
        danhSachTienIch.push(...ketQua.value);
      } else {
        danhSachTienIch.push({
          id: `loi-${nhaCungCap.id}`,
          loai: 'THE_THONG_KE',
          tieuDe: `Tiện ích ${nhaCungCap.id}`,
          trangThai: 'LOI',
          duLieu: null,
          thongDiepLoi: 'Không thể tải dữ liệu tiện ích này. Vui lòng thử lại sau.',
        });
      }
    });

    return danhSachTienIch;
  }
}
