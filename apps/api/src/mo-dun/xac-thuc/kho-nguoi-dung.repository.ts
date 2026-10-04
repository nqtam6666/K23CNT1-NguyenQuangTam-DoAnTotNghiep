import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma, NguoiDung, PhienDangNhap } from '@prisma/client';

@Injectable()
export class KhoNguoiDung {
  constructor(private readonly prisma: PrismaService) {}

  async timTheoId(id: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  async timTheoEmail(email: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  async taoNguoiDung(duLieu: Prisma.NguoiDungCreateInput): Promise<NguoiDung> {
    return this.prisma.nguoiDung.create({
      data: duLieu,
    });
  }

  async capNhatNguoiDung(id: string, duLieu: Prisma.NguoiDungUpdateInput): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: duLieu,
    });
  }

  async taoPhienDangNhap(duLieu: Prisma.PhienDangNhapCreateInput): Promise<PhienDangNhap> {
    return this.prisma.phienDangNhap.create({
      data: duLieu,
    });
  }

  async timPhienTheoId(id: string): Promise<PhienDangNhap | null> {
    return this.prisma.phienDangNhap.findUnique({
      where: { id },
    });
  }

  async thuHoiPhien(id: string): Promise<PhienDangNhap> {
    return this.prisma.phienDangNhap.update({
      where: { id },
      data: { daThuHoi: true },
    });
  }

  async thuHoiTatCaPhienCuaNguoiDung(idNguoiDung: string): Promise<Prisma.BatchPayload> {
    return this.prisma.phienDangNhap.updateMany({
      where: { idNguoiDung, daThuHoi: false },
      data: { daThuHoi: true },
    });
  }
}
