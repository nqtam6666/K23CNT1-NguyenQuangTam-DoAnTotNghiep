import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma, HoSoHocSinh, HoSoGiaoVien, PhuHuynhHocSinh } from '@prisma/client';
import { TruyVanHoSoHocSinhDto, TruyVanPhanTrangDto } from '@lms/chung';

@Injectable()
export class KhoHoSo {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== HỒ SƠ HỌC SINH ====================

  async timHoSoHocSinhTheoId(id: string): Promise<any | null> {
    return this.prisma.hoSoHocSinh.findUnique({
      where: { id },
      include: {
        nguoiDung: {
          select: {
            id: true,
            email: true,
            hoTen: true,
            soDienThoai: true,
            anhDaiDien: true,
            kichHoat: true,
          },
        },
        lopHanhChinh: true,
        lienKetPhuHuynh: {
          include: {
            phuHuynh: {
              select: {
                id: true,
                email: true,
                hoTen: true,
                soDienThoai: true,
              },
            },
          },
        },
      },
    });
  }

  async timHoSoHocSinhTheoIdNguoiDung(idNguoiDung: string): Promise<any | null> {
    return this.prisma.hoSoHocSinh.findUnique({
      where: { idNguoiDung },
      include: {
        lopHanhChinh: true,
      },
    });
  }

  async timHoSoHocSinhTheoMa(maHocSinh: string): Promise<HoSoHocSinh | null> {
    return this.prisma.hoSoHocSinh.findUnique({
      where: { maHocSinh },
    });
  }

  async taoHoSoHocSinh(duLieu: Prisma.HoSoHocSinhCreateInput): Promise<HoSoHocSinh> {
    return this.prisma.hoSoHocSinh.create({
      data: duLieu,
    });
  }

  async capNhatHoSoHocSinh(
    id: string,
    duLieu: Prisma.HoSoHocSinhUpdateInput,
  ): Promise<HoSoHocSinh> {
    return this.prisma.hoSoHocSinh.update({
      where: { id },
      data: duLieu,
    });
  }

  async timDanhSachHocSinh(thamSo: TruyVanHoSoHocSinhDto) {
    const { trang = 1, kichThuoc = 10, tuKhoa, idLopHanhChinh } = thamSo;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKienLoc: Prisma.HoSoHocSinhWhereInput = {
      ...(idLopHanhChinh ? { idLopHanhChinh } : {}),
      ...(tuKhoa
        ? {
            OR: [
              { maHocSinh: { contains: tuKhoa, mode: 'insensitive' } },
              { nguoiDung: { hoTen: { contains: tuKhoa, mode: 'insensitive' } } },
              { nguoiDung: { email: { contains: tuKhoa, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.hoSoHocSinh.findMany({
        where: dieuKienLoc,
        skip: boQua,
        take: kichThuoc,
        orderBy: { ngayTao: 'desc' },
        include: {
          nguoiDung: {
            select: {
              id: true,
              email: true,
              hoTen: true,
              soDienThoai: true,
              anhDaiDien: true,
              kichHoat: true,
            },
          },
          lopHanhChinh: {
            select: {
              id: true,
              maLop: true,
              tenLop: true,
              khoiLop: true,
            },
          },
        },
      }),
      this.prisma.hoSoHocSinh.count({ where: dieuKienLoc }),
    ]);

    return {
      danhSach,
      tongSo,
      trangHienTai: trang,
      kichThuocTrang: kichThuoc,
      tongSoTrang: Math.ceil(tongSo / kichThuoc),
    };
  }

  // ==================== HỒ SƠ GIÁO VIÊN ====================

  async timHoSoGiaoVienTheoId(id: string): Promise<any | null> {
    return this.prisma.hoSoGiaoVien.findUnique({
      where: { id },
      include: {
        nguoiDung: {
          select: {
            id: true,
            email: true,
            hoTen: true,
            soDienThoai: true,
            anhDaiDien: true,
            kichHoat: true,
          },
        },
        cacLopChuNhiem: true,
        cacLopGiangDay: {
          include: {
            monHoc: true,
            hocKy: true,
          },
        },
      },
    });
  }

  async timHoSoGiaoVienTheoIdNguoiDung(idNguoiDung: string): Promise<any | null> {
    return this.prisma.hoSoGiaoVien.findUnique({
      where: { idNguoiDung },
      include: {
        cacLopChuNhiem: true,
        cacLopGiangDay: {
          include: {
            monHoc: true,
            hocKy: true,
          },
        },
      },
    });
  }

  async timHoSoGiaoVienTheoMa(maGiaoVien: string): Promise<HoSoGiaoVien | null> {
    return this.prisma.hoSoGiaoVien.findUnique({
      where: { maGiaoVien },
    });
  }

  async taoHoSoGiaoVien(duLieu: Prisma.HoSoGiaoVienCreateInput): Promise<HoSoGiaoVien> {
    return this.prisma.hoSoGiaoVien.create({
      data: duLieu,
    });
  }

  async capNhatHoSoGiaoVien(
    id: string,
    duLieu: Prisma.HoSoGiaoVienUpdateInput,
  ): Promise<HoSoGiaoVien> {
    return this.prisma.hoSoGiaoVien.update({
      where: { id },
      data: duLieu,
    });
  }

  async timDanhSachGiaoVien(thamSo: TruyVanPhanTrangDto) {
    const { trang = 1, kichThuoc = 10, tuKhoa } = thamSo;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKienLoc: Prisma.HoSoGiaoVienWhereInput = tuKhoa
      ? {
          OR: [
            { maGiaoVien: { contains: tuKhoa, mode: 'insensitive' } },
            { chuyenMon: { contains: tuKhoa, mode: 'insensitive' } },
            { nguoiDung: { hoTen: { contains: tuKhoa, mode: 'insensitive' } } },
            { nguoiDung: { email: { contains: tuKhoa, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.hoSoGiaoVien.findMany({
        where: dieuKienLoc,
        skip: boQua,
        take: kichThuoc,
        orderBy: { ngayTao: 'desc' },
        include: {
          nguoiDung: {
            select: {
              id: true,
              email: true,
              hoTen: true,
              soDienThoai: true,
              anhDaiDien: true,
              kichHoat: true,
            },
          },
        },
      }),
      this.prisma.hoSoGiaoVien.count({ where: dieuKienLoc }),
    ]);

    return {
      danhSach,
      tongSo,
      trangHienTai: trang,
      kichThuocTrang: kichThuoc,
      tongSoTrang: Math.ceil(tongSo / kichThuoc),
    };
  }

  // ==================== LIÊN KẾT PHỤ HUYNH - HỌC SINH ====================

  async thietLapLienKetPhuHuynh(
    idPhuHuynh: string,
    idHocSinh: string,
    moiQuanHe: string,
  ): Promise<PhuHuynhHocSinh> {
    return this.prisma.phuHuynhHocSinh.upsert({
      where: {
        idPhuHuynh_idHocSinh: { idPhuHuynh, idHocSinh },
      },
      update: { moiQuanHe },
      create: {
        idPhuHuynh,
        idHocSinh,
        moiQuanHe,
      },
    });
  }

  async xoaLienKetPhuHuynh(idPhuHuynh: string, idHocSinh: string): Promise<PhuHuynhHocSinh> {
    return this.prisma.phuHuynhHocSinh.delete({
      where: {
        idPhuHuynh_idHocSinh: { idPhuHuynh, idHocSinh },
      },
    });
  }

  async kiemTraLienKet(idPhuHuynh: string, idHocSinh: string): Promise<boolean> {
    const lienKet = await this.prisma.phuHuynhHocSinh.findUnique({
      where: {
        idPhuHuynh_idHocSinh: { idPhuHuynh, idHocSinh },
      },
    });
    return !!lienKet;
  }

  async layDanhSachConEmCuaPhuHuynh(idPhuHuynh: string) {
    return this.prisma.phuHuynhHocSinh.findMany({
      where: { idPhuHuynh },
      include: {
        hocSinh: {
          include: {
            nguoiDung: {
              select: {
                id: true,
                email: true,
                hoTen: true,
                soDienThoai: true,
                anhDaiDien: true,
              },
            },
            lopHanhChinh: true,
          },
        },
      },
    });
  }
}
