import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { TrangThaiBuoiHoc } from '@prisma/client';
import {
  TaoThoiKhoaBieuInput,
  CapNhatThoiKhoaBieuInput,
  TaoBuoiHocInput,
  CapNhatBuoiHocInput,
} from '@lms/chung';

@Injectable()
export class KhoThoiKhoaBieuRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // THỜI KHÓA BIỂU
  // ==========================================

  async layThoiKhoaBieuTheoLop(idLopHocPhan: string) {
    return this.prisma.thoiKhoaBieu.findMany({
      where: { idLopHocPhan },
      orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async timThoiKhoaBieuTheoId(id: string) {
    return this.prisma.thoiKhoaBieu.findUnique({
      where: { id },
      include: {
        lopHocPhan: {
          include: {
            giaoVien: true,
          },
        },
      },
    });
  }

  async kiemTraXungDotPhong(
    thuTrongTuan: number,
    tietBatDau: number,
    soTiet: number,
    phongHoc: string,
    idHocKy: string,
    idBoQua?: string,
  ) {
    const tietKetThuc = tietBatDau + soTiet - 1;

    // Tìm các tiết học cùng phòng, cùng thứ trong cùng học kỳ
    const cacLop = await this.prisma.thoiKhoaBieu.findMany({
      where: {
        id: idBoQua ? { not: idBoQua } : undefined,
        thuTrongTuan,
        phongHoc: { equals: phongHoc, mode: 'insensitive' },
        lopHocPhan: {
          idHocKy,
          kichHoat: true,
        },
      },
      include: {
        lopHocPhan: true,
      },
    });

    // Kiểm tra giao khoảng tiết: max(start1, start2) <= min(end1, end2)
    return cacLop.find((tkb) => {
      const start = tkb.tietBatDau;
      const end = tkb.tietBatDau + tkb.soTiet - 1;
      return Math.max(tietBatDau, start) <= Math.min(tietKetThuc, end);
    });
  }

  async kiemTraXungDotGiaoVien(
    idGiaoVien: string,
    thuTrongTuan: number,
    tietBatDau: number,
    soTiet: number,
    idHocKy: string,
    idBoQua?: string,
  ) {
    const tietKetThuc = tietBatDau + soTiet - 1;

    const cacLop = await this.prisma.thoiKhoaBieu.findMany({
      where: {
        id: idBoQua ? { not: idBoQua } : undefined,
        thuTrongTuan,
        lopHocPhan: {
          idGiaoVien,
          idHocKy,
          kichHoat: true,
        },
      },
      include: {
        lopHocPhan: true,
      },
    });

    return cacLop.find((tkb) => {
      const start = tkb.tietBatDau;
      const end = tkb.tietBatDau + tkb.soTiet - 1;
      return Math.max(tietBatDau, start) <= Math.min(tietKetThuc, end);
    });
  }

  async taoThoiKhoaBieu(idLopHocPhan: string, duLieu: TaoThoiKhoaBieuInput) {
    return this.prisma.thoiKhoaBieu.create({
      data: {
        idLopHocPhan,
        thuTrongTuan: duLieu.thuTrongTuan,
        tietBatDau: duLieu.tietBatDau,
        soTiet: duLieu.soTiet,
        phongHoc: duLieu.phongHoc,
      },
      include: { lopHocPhan: true },
    });
  }

  async capNhatThoiKhoaBieu(id: string, duLieu: CapNhatThoiKhoaBieuInput) {
    return this.prisma.thoiKhoaBieu.update({
      where: { id },
      data: duLieu,
      include: { lopHocPhan: true },
    });
  }

  async xoaThoiKhoaBieu(id: string) {
    return this.prisma.thoiKhoaBieu.delete({
      where: { id },
    });
  }

  // ==========================================
  // BUỔI HỌC
  // ==========================================

  async layDanhSachBuoiHocTheoLop(idLopHocPhan: string) {
    return this.prisma.buoiHoc.findMany({
      where: { idLopHocPhan },
      orderBy: { thoiGianBD: 'asc' },
    });
  }

  async timBuoiHocTheoId(id: string) {
    return this.prisma.buoiHoc.findUnique({
      where: { id },
      include: {
        lopHocPhan: {
          include: {
            giaoVien: { include: { nguoiDung: true } },
            monHoc: true,
          },
        },
      },
    });
  }

  async taoBuoiHoc(duLieu: TaoBuoiHocInput) {
    return this.prisma.buoiHoc.create({
      data: {
        idLopHocPhan: duLieu.idLopHocPhan,
        chuDe: duLieu.chuDe,
        thoiGianBD: new Date(duLieu.thoiGianBD),
        thoiGianKT: new Date(duLieu.thoiGianKT),
        trangThai: (duLieu.trangThai as TrangThaiBuoiHoc) ?? TrangThaiBuoiHoc.CHUA_BAT_DAU,
      },
      include: { lopHocPhan: true },
    });
  }

  async capNhatBuoiHoc(id: string, duLieu: CapNhatBuoiHocInput) {
    return this.prisma.buoiHoc.update({
      where: { id },
      data: {
        ...(duLieu.chuDe ? { chuDe: duLieu.chuDe } : {}),
        ...(duLieu.thoiGianBD ? { thoiGianBD: new Date(duLieu.thoiGianBD) } : {}),
        ...(duLieu.thoiGianKT ? { thoiGianKT: new Date(duLieu.thoiGianKT) } : {}),
        ...(duLieu.trangThai ? { trangThai: duLieu.trangThai as TrangThaiBuoiHoc } : {}),
      },
      include: { lopHocPhan: true },
    });
  }

  async xoaBuoiHoc(id: string) {
    return this.prisma.buoiHoc.delete({
      where: { id },
    });
  }

  // ==========================================
  // THỜI KHÓA BIỂU CÁ NHÂN THEO TUẦN
  // ==========================================

  async layThoiKhoaBieuGiaoVien(idHoSoGiaoVien: string, idHocKy?: string) {
    return this.prisma.thoiKhoaBieu.findMany({
      where: {
        lopHocPhan: {
          idGiaoVien: idHoSoGiaoVien,
          idHocKy: idHocKy ? idHocKy : undefined,
          kichHoat: true,
        },
      },
      include: {
        lopHocPhan: {
          include: {
            monHoc: true,
            hocKy: true,
          },
        },
      },
      orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
    });
  }

  async layThoiKhoaBieuHocSinh(idHoSoHocSinh: string, idHocKy?: string) {
    return this.prisma.thoiKhoaBieu.findMany({
      where: {
        lopHocPhan: {
          idHocKy: idHocKy ? idHocKy : undefined,
          kichHoat: true,
          danhSachGhiDanh: {
            some: { idHocSinh: idHoSoHocSinh },
          },
        },
      },
      include: {
        lopHocPhan: {
          include: {
            monHoc: true,
            hocKy: true,
            giaoVien: { include: { nguoiDung: true } },
          },
        },
      },
      orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
    });
  }
}
