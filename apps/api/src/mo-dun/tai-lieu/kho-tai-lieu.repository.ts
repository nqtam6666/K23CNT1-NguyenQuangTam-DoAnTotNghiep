import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { LoaiTaiLieu } from '@lms/chung';

@Injectable()
export class KhoTaiLieuRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSachTheoLop(idLopHocPhan: string) {
    return this.prisma.taiLieu.findMany({
      where: { idLopHocPhan },
      include: {
        _count: {
          select: { cacDoanRAG: true },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async timTheoId(id: string) {
    return this.prisma.taiLieu.findUnique({
      where: { id },
      include: {
        lopHocPhan: true,
        _count: {
          select: { cacDoanRAG: true },
        },
      },
    });
  }

  async taoTaiLieu(duLieu: {
    idLopHocPhan: string;
    tieuDe: string;
    moTa?: string | null;
    duongDanTep: string;
    loaiTaiLieu: LoaiTaiLieu;
    kichThuocTep: number;
  }) {
    return this.prisma.taiLieu.create({
      data: duLieu,
    });
  }

  async capNhatTaiLieu(
    id: string,
    duLieu: {
      tieuDe?: string;
      moTa?: string | null;
      duongDanTep?: string;
      kichThuocTep?: number;
    },
  ) {
    return this.prisma.taiLieu.update({
      where: { id },
      data: duLieu,
    });
  }

  async xoaTaiLieu(id: string) {
    return this.prisma.taiLieu.delete({
      where: { id },
    });
  }
}
