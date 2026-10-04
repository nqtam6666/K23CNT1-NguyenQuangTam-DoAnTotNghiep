import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma } from '@prisma/client';
import { TaoLopHocPhanInput, CapNhatLopHocPhanInput, TruyVanLopHocPhanInput } from '@lms/chung';

@Injectable()
export class KhoLopHocPhanRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // LỚP HỌC PHẦN
  // ==========================================

  async layDanhSachLopHocPhan(truyVan: TruyVanLopHocPhanInput) {
    const { trang, kichThuoc, tuKhoa, idHocKy, idMonHoc, idGiaoVien, kichHoat } = truyVan;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKien: Prisma.LopHocPhanWhereInput = {
      ...(idHocKy ? { idHocKy } : {}),
      ...(idMonHoc ? { idMonHoc } : {}),
      ...(idGiaoVien ? { idGiaoVien } : {}),
      ...(kichHoat !== undefined ? { kichHoat } : {}),
      ...(tuKhoa
        ? {
            OR: [
              { maLopHocPhan: { contains: tuKhoa, mode: 'insensitive' } },
              { tenLopHocPhan: { contains: tuKhoa, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.lopHocPhan.findMany({
        where: dieuKien,
        skip: boQua,
        take: kichThuoc,
        orderBy: { ngayTao: 'desc' },
        include: {
          monHoc: true,
          hocKy: { include: { namHoc: true } },
          giaoVien: {
            include: {
              nguoiDung: {
                select: { id: true, hoTen: true, email: true, anhDaiDien: true },
              },
            },
          },
          _count: {
            select: {
              danhSachGhiDanh: true,
              cacBuoiHoc: true,
            },
          },
        },
      }),
      this.prisma.lopHocPhan.count({ where: dieuKien }),
    ]);

    return { danhSach, tongSo };
  }

  async timLopHocPhanTheoId(id: string) {
    return this.prisma.lopHocPhan.findUnique({
      where: { id },
      include: {
        monHoc: true,
        hocKy: { include: { namHoc: true } },
        giaoVien: {
          include: {
            nguoiDung: {
              select: { id: true, hoTen: true, email: true, anhDaiDien: true, soDienThoai: true },
            },
          },
        },
        phongTrucTuyen: true,
        cacThoiKhoaBieu: {
          orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
        },
        _count: {
          select: {
            danhSachGhiDanh: true,
            cacBuoiHoc: true,
            cacBaiTap: true,
          },
        },
      },
    });
  }

  async timLopHocPhanTheoMa(maLopHocPhan: string) {
    return this.prisma.lopHocPhan.findUnique({
      where: { maLopHocPhan },
    });
  }

  async timLopHocPhanTheoMaThamGia(maThamGia: string) {
    return this.prisma.lopHocPhan.findUnique({
      where: { maThamGia },
      include: {
        monHoc: true,
        giaoVien: { include: { nguoiDung: true } },
      },
    });
  }

  async taoLopHocPhan(duLieu: TaoLopHocPhanInput & { maThamGia: string }) {
    return this.prisma.$transaction(async (tx) => {
      const lop = await tx.lopHocPhan.create({
        data: duLieu,
        include: {
          monHoc: true,
          hocKy: true,
          giaoVien: { include: { nguoiDung: true } },
        },
      });

      // Tự động tạo Phòng trực tuyến tương ứng
      await tx.phongTrucTuyen.create({
        data: {
          idLopHocPhan: lop.id,
          tenPhong: `lms-room-${lop.maLopHocPhan.toLowerCase()}-${Date.now().toString(36)}`,
        },
      });

      return lop;
    });
  }

  async capNhatLopHocPhan(id: string, duLieu: CapNhatLopHocPhanInput) {
    return this.prisma.lopHocPhan.update({
      where: { id },
      data: duLieu,
      include: {
        monHoc: true,
        hocKy: true,
        giaoVien: { include: { nguoiDung: true } },
      },
    });
  }

  async xoaLopHocPhan(id: string) {
    return this.prisma.lopHocPhan.delete({
      where: { id },
    });
  }

  // ==========================================
  // LỚP HỌC PHẦN THEO VAI TRÒ
  // ==========================================

  async layLopHocPhanTheoGiaoVien(idHoSoGiaoVien: string) {
    return this.prisma.lopHocPhan.findMany({
      where: { idGiaoVien: idHoSoGiaoVien },
      orderBy: { ngayTao: 'desc' },
      include: {
        monHoc: true,
        hocKy: { include: { namHoc: true } },
        _count: {
          select: {
            danhSachGhiDanh: true,
            cacBuoiHoc: true,
          },
        },
      },
    });
  }

  async layLopHocPhanTheoHocSinh(idHoSoHocSinh: string) {
    return this.prisma.lopHocPhan.findMany({
      where: {
        danhSachGhiDanh: {
          some: { idHocSinh: idHoSoHocSinh },
        },
      },
      orderBy: { ngayTao: 'desc' },
      include: {
        monHoc: true,
        hocKy: { include: { namHoc: true } },
        giaoVien: {
          include: {
            nguoiDung: {
              select: { id: true, hoTen: true, email: true, anhDaiDien: true },
            },
          },
        },
        _count: {
          select: { cacBuoiHoc: true },
        },
      },
    });
  }

  // ==========================================
  // GHI DANH
  // ==========================================

  async layDanhSachGhiDanh(idLopHocPhan: string) {
    return this.prisma.ghiDanh.findMany({
      where: { idLopHocPhan },
      orderBy: { ngayGhiDanh: 'asc' },
      include: {
        hocSinh: {
          include: {
            nguoiDung: {
              select: {
                id: true,
                hoTen: true,
                email: true,
                anhDaiDien: true,
                soDienThoai: true,
              },
            },
            lopHanhChinh: {
              select: { id: true, maLop: true, tenLop: true },
            },
          },
        },
      },
    });
  }

  async kiemTraGhiDanh(idLopHocPhan: string, idHocSinh: string) {
    return this.prisma.ghiDanh.findUnique({
      where: {
        idLopHocPhan_idHocSinh: {
          idLopHocPhan,
          idHocSinh,
        },
      },
    });
  }

  async taoGhiDanh(idLopHocPhan: string, idHocSinh: string) {
    return this.prisma.ghiDanh.create({
      data: {
        idLopHocPhan,
        idHocSinh,
      },
      include: {
        hocSinh: {
          include: {
            nguoiDung: true,
            lopHanhChinh: true,
          },
        },
      },
    });
  }

  async taoGhiDanhNhieu(idLopHocPhan: string, danhSachIdHocSinh: string[]) {
    const duLieu = danhSachIdHocSinh.map((idHocSinh) => ({
      idLopHocPhan,
      idHocSinh,
    }));

    return this.prisma.ghiDanh.createMany({
      data: duLieu,
      skipDuplicates: true,
    });
  }

  async xoaGhiDanh(idLopHocPhan: string, idHocSinh: string) {
    return this.prisma.ghiDanh.delete({
      where: {
        idLopHocPhan_idHocSinh: {
          idLopHocPhan,
          idHocSinh,
        },
      },
    });
  }

  async layDanhSachHocSinhTheoLopHanhChinh(idLopHanhChinh: string) {
    return this.prisma.hoSoHocSinh.findMany({
      where: { idLopHanhChinh },
      select: { id: true },
    });
  }
}
