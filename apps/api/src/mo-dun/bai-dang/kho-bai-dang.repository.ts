import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';

@Injectable()
export class KhoBaiDangRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSachTheoLop(idLopHocPhan: string) {
    return this.prisma.baiDang.findMany({
      where: { idLopHocPhan },
      include: {
        nguoiDang: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
        cacBinhLuan: {
          include: {
            nguoiDung: {
              select: {
                id: true,
                hoTen: true,
                email: true,
                anhDaiDien: true,
              },
            },
          },
          orderBy: { ngayTao: 'asc' },
        },
      },
      orderBy: [{ ghimDauTrang: 'desc' }, { ngayTao: 'desc' }],
    });
  }

  async timTheoId(id: string) {
    return this.prisma.baiDang.findUnique({
      where: { id },
      include: {
        nguoiDang: true,
        lopHocPhan: true,
      },
    });
  }

  async taoBaiDang(duLieu: {
    idLopHocPhan: string;
    idNguoiDung: string;
    noiDung: string;
    ghimDauTrang?: boolean;
  }) {
    return this.prisma.baiDang.create({
      data: duLieu,
      include: {
        nguoiDang: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
        cacBinhLuan: true,
      },
    });
  }

  async xoaBaiDang(id: string) {
    return this.prisma.baiDang.delete({
      where: { id },
    });
  }

  async taoBinhLuan(duLieu: {
    idBaiDang: string;
    idNguoiDung: string;
    noiDung: string;
  }) {
    return this.prisma.binhLuan.create({
      data: duLieu,
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
          },
        },
      },
    });
  }

  async timBinhLuanTheoId(id: string) {
    return this.prisma.binhLuan.findUnique({
      where: { id },
      include: {
        baiDang: {
          include: {
            lopHocPhan: true,
          },
        },
      },
    });
  }

  async xoaBinhLuan(id: string) {
    return this.prisma.binhLuan.delete({
      where: { id },
    });
  }
}
