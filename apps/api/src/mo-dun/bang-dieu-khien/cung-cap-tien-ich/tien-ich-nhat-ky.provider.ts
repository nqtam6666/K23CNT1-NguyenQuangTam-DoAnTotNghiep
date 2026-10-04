import { Injectable } from '@nestjs/common';
import { PayloadJwt, VaiTro, TienIchBangDieuKhien, HoatDongGanDay } from '@lms/chung';
import { PrismaService } from '../../../cot-loi/csdl/prisma.service';
import { NhaCungCapTienIch } from '../so-dang-ky-tien-ich.registry';

@Injectable()
export class TienIchNhatKyProvider implements NhaCungCapTienIch {
  readonly id = 'nhat-ky-he-thong';

  constructor(private readonly prisma: PrismaService) {}

  vaiTroPhuHop(vaiTro: VaiTro): boolean {
    return vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.BAN_GIAM_HIEU;
  }

  async cungCapTienIch(_nguoiDung: PayloadJwt): Promise<TienIchBangDieuKhien[]> {
    const nhatKy = await this.prisma.nhatKyHeThong.findMany({
      take: 8,
      orderBy: { ngayTao: 'desc' },
      include: {
        nguoiDung: { select: { hoTen: true, email: true } },
      },
    });

    const danhSachHoatDong: HoatDongGanDay[] = nhatKy.map((nk) => ({
      id: nk.id,
      hanhDong: nk.hanhDong,
      thucThe: nk.thucThe,
      idThucThe: nk.idThucThe || undefined,
      tenNguoiThucHien: nk.nguoiDung?.hoTen || 'Hệ thống tự động',
      thoiGian: nk.ngayTao.toISOString(),
      chiTiet: (nk.chiTiet as Record<string, any>) || undefined,
    }));

    return [
      {
        id: 'hoat-dong-gan-day',
        loai: 'HOAT_DONG_GAN_DAY',
        tieuDe: 'Hoạt động gần đây',
        moTa: 'Nhật ký kiểm toán các thao tác trên hệ thống',
        duongDanChiTiet: '/cai-dat',
        trangThai: 'THANH_CONG',
        duLieu: danhSachHoatDong,
      },
    ];
  }
}
