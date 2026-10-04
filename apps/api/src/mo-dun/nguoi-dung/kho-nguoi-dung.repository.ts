import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma, NguoiDung, PhienDangNhap } from '@prisma/client';
import { TruyVanNguoiDungDto, VaiTro } from '@lms/chung';

@Injectable()
export class KhoNguoiDung {
  constructor(private readonly prisma: PrismaService) {}

  async timTheoId(id: string, kemHoSo = false): Promise<any | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
      include: kemHoSo
        ? {
            hoSoHocSinh: {
              include: {
                lopHanhChinh: true,
              },
            },
            hoSoGiaoVien: true,
            lienKetPhuHuynh: {
              include: {
                hocSinh: {
                  include: {
                    nguoiDung: {
                      select: {
                        id: true,
                        hoTen: true,
                        email: true,
                        anhDaiDien: true,
                      },
                    },
                    lopHanhChinh: true,
                  },
                },
              },
            },
          }
        : undefined,
    });
  }

  async timTheoEmail(email: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  async timDanhSachPhanTrang(thamSo: TruyVanNguoiDungDto) {
    const { trang = 1, kichThuoc = 10, tuKhoa, vaiTro, kichHoat } = thamSo;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKienLoc: Prisma.NguoiDungWhereInput = {
      ngayXoa: null, // Chỉ lấy người dùng chưa bị xóa mềm
      ...(vaiTro ? { vaiTro: vaiTro as VaiTro } : {}),
      ...(kichHoat !== undefined ? { kichHoat } : {}),
      ...(tuKhoa
        ? {
            OR: [
              { hoTen: { contains: tuKhoa, mode: 'insensitive' } },
              { email: { contains: tuKhoa, mode: 'insensitive' } },
              { soDienThoai: { contains: tuKhoa } },
            ],
          }
        : {}),
    };

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.nguoiDung.findMany({
        where: dieuKienLoc,
        skip: boQua,
        take: kichThuoc,
        orderBy: { ngayTao: 'desc' },
        select: {
          id: true,
          email: true,
          hoTen: true,
          soDienThoai: true,
          anhDaiDien: true,
          vaiTro: true,
          kichHoat: true,
          ngayTao: true,
          ngayCapNhat: true,
        },
      }),
      this.prisma.nguoiDung.count({ where: dieuKienLoc }),
    ]);

    return {
      danhSach,
      tongSo,
      trangHienTai: trang,
      kichThuocTrang: kichThuoc,
      tongSoTrang: Math.ceil(tongSo / kichThuoc),
    };
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

  async chuyenTrangThai(id: string, kichHoat: boolean): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { kichHoat },
    });
  }

  async xoaMem(id: string): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { ngayXoa: new Date(), kichHoat: false },
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
