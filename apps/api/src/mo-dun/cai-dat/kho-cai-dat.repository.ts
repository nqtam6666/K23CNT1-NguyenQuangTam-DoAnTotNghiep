import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { CaiDatHeThong } from '@prisma/client';

@Injectable()
export class KhoCaiDatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSach(): Promise<CaiDatHeThong[]> {
    const danhSach = await this.prisma.caiDatHeThong.findMany({
      orderBy: [{ nhom: 'asc' }, { khoa: 'asc' }],
    });
    const daCoThoiGianPhien = danhSach.some((item) => item.khoa === 'THOI_GIAN_PHIEN_GIAY');
    if (!daCoThoiGianPhien) {
      const moi = await this.prisma.caiDatHeThong.upsert({
        where: { khoa: 'THOI_GIAN_PHIEN_GIAY' },
        update: {},
        create: {
          khoa: 'THOI_GIAN_PHIEN_GIAY',
          giaTri: '86400',
          nhom: 'HOC_VU',
          moTa: 'Thời gian duy trì phiên đăng nhập tính bằng giây',
          kieuDuLieu: 'SO',
          congKhai: true,
        },
      });
      danhSach.push(moi);
    }
    return danhSach;
  }

  async layDanhSachCongKhai(): Promise<CaiDatHeThong[]> {
    return this.prisma.caiDatHeThong.findMany({
      where: { congKhai: true },
      orderBy: [{ nhom: 'asc' }, { khoa: 'asc' }],
    });
  }

  async layTheoKhoa(khoa: string): Promise<CaiDatHeThong | null> {
    return this.prisma.caiDatHeThong.findUnique({
      where: { khoa },
    });
  }

  async capNhat(khoa: string, giaTri: string): Promise<CaiDatHeThong> {
    return this.prisma.caiDatHeThong.upsert({
      where: { khoa },
      update: { giaTri },
      create: {
        khoa,
        giaTri,
        nhom: 'CHUNG',
        kieuDuLieu: 'CHUOI',
        congKhai: true,
      },
    });
  }

  async capNhatNhieu(danhSach: Array<{ khoa: string; giaTri: string }>): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      let dem = 0;
      for (const item of danhSach) {
        await tx.caiDatHeThong.upsert({
          where: { khoa: item.khoa },
          update: { giaTri: item.giaTri },
          create: {
            khoa: item.khoa,
            giaTri: item.giaTri,
            nhom: 'CHUNG',
            kieuDuLieu: 'CHUOI',
            congKhai: true,
          },
        });
        dem++;
      }
      return dem;
    });
  }
}
