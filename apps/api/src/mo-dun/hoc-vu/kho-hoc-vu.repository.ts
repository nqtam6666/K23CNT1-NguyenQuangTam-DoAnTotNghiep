import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma } from '@prisma/client';
import {
  TaoNamHocInput,
  CapNhatNamHocInput,
  TaoHocKyInput,
  CapNhatHocKyInput,
  TaoMonHocInput,
  CapNhatMonHocInput,
  TruyVanMonHocInput,
  TaoLopHanhChinhInput,
  CapNhatLopHanhChinhInput,
  TruyVanLopHanhChinhInput,
} from '@lms/chung';

@Injectable()
export class KhoHocVuRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // NĂM HỌC
  // ==========================================

  async layDanhSachNamHoc() {
    return this.prisma.namHoc.findMany({
      orderBy: { tenNamHoc: 'desc' },
      include: {
        cacHocKy: {
          orderBy: { ngayBatDau: 'asc' },
        },
      },
    });
  }

  async timNamHocTheoId(id: string) {
    return this.prisma.namHoc.findUnique({
      where: { id },
      include: { cacHocKy: true },
    });
  }

  async timNamHocTheoTen(tenNamHoc: string) {
    return this.prisma.namHoc.findUnique({
      where: { tenNamHoc },
    });
  }

  async taoNamHoc(duLieu: TaoNamHocInput) {
    if (duLieu.hienTai) {
      // Nếu đặt năm học này là hiện tại, bỏ cờ hiện tại ở các năm học khác
      await this.prisma.namHoc.updateMany({
        where: { hienTai: true },
        data: { hienTai: false },
      });
    }

    return this.prisma.namHoc.create({
      data: duLieu,
      include: { cacHocKy: true },
    });
  }

  async capNhatNamHoc(id: string, duLieu: CapNhatNamHocInput) {
    if (duLieu.hienTai) {
      await this.prisma.namHoc.updateMany({
        where: { id: { not: id }, hienTai: true },
        data: { hienTai: false },
      });
    }

    return this.prisma.namHoc.update({
      where: { id },
      data: duLieu,
      include: { cacHocKy: true },
    });
  }

  async xoaNamHoc(id: string) {
    return this.prisma.namHoc.delete({
      where: { id },
    });
  }

  // ==========================================
  // HỌC KỲ
  // ==========================================

  async layDanhSachHocKyTheoNam(idNamHoc?: string) {
    return this.prisma.hocKy.findMany({
      where: idNamHoc ? { idNamHoc } : undefined,
      orderBy: { ngayBatDau: 'asc' },
      include: {
        namHoc: true,
      },
    });
  }

  async timHocKyTheoId(id: string) {
    return this.prisma.hocKy.findUnique({
      where: { id },
      include: { namHoc: true },
    });
  }

  async taoHocKy(duLieu: TaoHocKyInput) {
    if (duLieu.hienTai) {
      await this.prisma.hocKy.updateMany({
        where: { hienTai: true },
        data: { hienTai: false },
      });
    }

    return this.prisma.hocKy.create({
      data: {
        idNamHoc: duLieu.idNamHoc,
        tenHocKy: duLieu.tenHocKy,
        hienTai: duLieu.hienTai ?? false,
        ngayBatDau: new Date(duLieu.ngayBatDau),
        ngayKetThuc: new Date(duLieu.ngayKetThuc),
      },
      include: { namHoc: true },
    });
  }

  async capNhatHocKy(id: string, duLieu: CapNhatHocKyInput) {
    if (duLieu.hienTai) {
      await this.prisma.hocKy.updateMany({
        where: { id: { not: id }, hienTai: true },
        data: { hienTai: false },
      });
    }

    const dataUpdate: Prisma.HocKyUpdateInput = {
      ...(duLieu.idNamHoc ? { namHoc: { connect: { id: duLieu.idNamHoc } } } : {}),
      ...(duLieu.tenHocKy ? { tenHocKy: duLieu.tenHocKy } : {}),
      ...(duLieu.hienTai !== undefined ? { hienTai: duLieu.hienTai } : {}),
      ...(duLieu.ngayBatDau ? { ngayBatDau: new Date(duLieu.ngayBatDau) } : {}),
      ...(duLieu.ngayKetThuc ? { ngayKetThuc: new Date(duLieu.ngayKetThuc) } : {}),
    };

    return this.prisma.hocKy.update({
      where: { id },
      data: dataUpdate,
      include: { namHoc: true },
    });
  }

  async xoaHocKy(id: string) {
    return this.prisma.hocKy.delete({
      where: { id },
    });
  }

  // ==========================================
  // MÔN HỌC
  // ==========================================

  async layDanhSachMonHoc(truyVan: TruyVanMonHocInput) {
    const { trang, kichThuoc, tuKhoa } = truyVan;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKien: Prisma.MonHocWhereInput = tuKhoa
      ? {
          OR: [
            { maMonHoc: { contains: tuKhoa, mode: 'insensitive' } },
            { tenMonHoc: { contains: tuKhoa, mode: 'insensitive' } },
          ],
        }
      : {};

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.monHoc.findMany({
        where: dieuKien,
        skip: boQua,
        take: kichThuoc,
        orderBy: { tenMonHoc: 'asc' },
        include: {
          _count: {
            select: { cacLopHocPhan: true },
          },
        },
      }),
      this.prisma.monHoc.count({ where: dieuKien }),
    ]);

    return { danhSach, tongSo };
  }

  async timMonHocTheoId(id: string) {
    return this.prisma.monHoc.findUnique({
      where: { id },
      include: {
        cacLopHocPhan: {
          include: {
            giaoVien: { include: { nguoiDung: true } },
            hocKy: true,
          },
        },
      },
    });
  }

  async timMonHocTheoMa(maMonHoc: string) {
    return this.prisma.monHoc.findUnique({
      where: { maMonHoc },
    });
  }

  async taoMonHoc(duLieu: TaoMonHocInput) {
    return this.prisma.monHoc.create({
      data: duLieu,
    });
  }

  async capNhatMonHoc(id: string, duLieu: CapNhatMonHocInput) {
    return this.prisma.monHoc.update({
      where: { id },
      data: duLieu,
    });
  }

  async xoaMonHoc(id: string) {
    return this.prisma.monHoc.delete({
      where: { id },
    });
  }

  // ==========================================
  // LỚP HÀNH CHÍNH
  // ==========================================

  async layDanhSachLopHanhChinh(truyVan: TruyVanLopHanhChinhInput) {
    const { trang, kichThuoc, tuKhoa, khoiLop } = truyVan;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKien: Prisma.LopHanhChinhWhereInput = {
      ...(khoiLop ? { khoiLop } : {}),
      ...(tuKhoa
        ? {
            OR: [
              { maLop: { contains: tuKhoa, mode: 'insensitive' } },
              { tenLop: { contains: tuKhoa, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.lopHanhChinh.findMany({
        where: dieuKien,
        skip: boQua,
        take: kichThuoc,
        orderBy: [{ khoiLop: 'asc' }, { tenLop: 'asc' }],
        include: {
          giaoVienChuNhiem: {
            include: {
              nguoiDung: {
                select: {
                  id: true,
                  hoTen: true,
                  email: true,
                  soDienThoai: true,
                },
              },
            },
          },
          _count: {
            select: { danhSachHocSinh: true },
          },
        },
      }),
      this.prisma.lopHanhChinh.count({ where: dieuKien }),
    ]);

    return { danhSach, tongSo };
  }

  async timLopHanhChinhTheoId(id: string) {
    return this.prisma.lopHanhChinh.findUnique({
      where: { id },
      include: {
        giaoVienChuNhiem: {
          include: {
            nguoiDung: {
              select: { id: true, hoTen: true, email: true, soDienThoai: true },
            },
          },
        },
        danhSachHocSinh: {
          include: {
            nguoiDung: {
              select: { id: true, hoTen: true, email: true, soDienThoai: true },
            },
          },
        },
      },
    });
  }

  async timLopHanhChinhTheoMa(maLop: string) {
    return this.prisma.lopHanhChinh.findUnique({
      where: { maLop },
    });
  }

  async taoLopHanhChinh(duLieu: TaoLopHanhChinhInput) {
    return this.prisma.lopHanhChinh.create({
      data: duLieu,
      include: {
        giaoVienChuNhiem: {
          include: {
            nguoiDung: true,
          },
        },
      },
    });
  }

  async capNhatLopHanhChinh(id: string, duLieu: CapNhatLopHanhChinhInput) {
    return this.prisma.lopHanhChinh.update({
      where: { id },
      data: duLieu,
      include: {
        giaoVienChuNhiem: {
          include: {
            nguoiDung: true,
          },
        },
      },
    });
  }

  async xoaLopHanhChinh(id: string) {
    return this.prisma.lopHanhChinh.delete({
      where: { id },
    });
  }
}
