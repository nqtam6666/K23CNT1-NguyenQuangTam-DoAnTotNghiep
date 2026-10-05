import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { HinhThucNop, TrangThaiBaiNop } from '@lms/chung';

@Injectable()
export class KhoBaiTapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSachTheoLop(idLopHocPhan: string, idHocSinh?: string) {
    return this.prisma.baiTap.findMany({
      where: { idLopHocPhan },
      include: {
        _count: {
          select: { cacBaiNop: true },
        },
        cacBaiNop: idHocSinh
          ? {
              where: { idNguoiDung: idHocSinh },
            }
          : false,
      },
      orderBy: { hanNop: 'asc' },
    });
  }

  async timTheoId(id: string) {
    return this.prisma.baiTap.findUnique({
      where: { id },
      include: {
        lopHocPhan: true,
      },
    });
  }

  async taoBaiTap(duLieu: {
    idLopHocPhan: string;
    tieuDe: string;
    noiDung: string;
    hanNop: Date;
    diemToiDa: number;
    hinhThucNop: HinhThucNop;
  }) {
    return this.prisma.baiTap.create({
      data: duLieu,
    });
  }

  async xoaBaiTap(id: string) {
    return this.prisma.baiTap.delete({
      where: { id },
    });
  }

  async timBaiNopCuaHocSinh(idBaiTap: string, idNguoiDung: string) {
    return this.prisma.baiNop.findUnique({
      where: {
        idBaiTap_idNguoiDung: {
          idBaiTap,
          idNguoiDung,
        },
      },
      include: {
        nguoiNop: {
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

  async luuBaiNop(duLieu: {
    idBaiTap: string;
    idNguoiDung: string;
    noiDung?: string | null;
    duongDanTep?: string | null;
    trangThai: TrangThaiBaiNop;
  }) {
    return this.prisma.baiNop.upsert({
      where: {
        idBaiTap_idNguoiDung: {
          idBaiTap: duLieu.idBaiTap,
          idNguoiDung: duLieu.idNguoiDung,
        },
      },
      create: {
        idBaiTap: duLieu.idBaiTap,
        idNguoiDung: duLieu.idNguoiDung,
        noiDung: duLieu.noiDung,
        duongDanTep: duLieu.duongDanTep,
        trangThai: duLieu.trangThai,
        ngayNop: new Date(),
      },
      update: {
        noiDung: duLieu.noiDung,
        duongDanTep: duLieu.duongDanTep,
        trangThai: duLieu.trangThai,
        ngayNop: new Date(),
      },
    });
  }

  async layDanhSachBaiNopTheoBaiTap(idBaiTap: string) {
    return this.prisma.baiNop.findMany({
      where: { idBaiTap },
      include: {
        nguoiNop: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            hoSoHocSinh: {
              select: {
                maHocSinh: true,
              },
            },
          },
        },
      },
      orderBy: { ngayNop: 'desc' },
    });
  }

  async timBaiNopTheoId(id: string) {
    return this.prisma.baiNop.findUnique({
      where: { id },
      include: {
        baiTap: {
          include: {
            lopHocPhan: true,
          },
        },
        nguoiNop: {
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

  async chamDiemBaiNop(id: string, diemSo: number, nhanXet?: string | null) {
    return this.prisma.baiNop.update({
      where: { id },
      data: {
        diemSo,
        nhanXet,
        trangThai: TrangThaiBaiNop.DA_CHAM,
        ngayCham: new Date(),
      },
    });
  }
}
