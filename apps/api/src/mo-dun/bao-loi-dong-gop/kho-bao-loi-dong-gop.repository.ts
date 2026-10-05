import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  TaoBaoLoiDongGopInput,
  XuLyBaoLoiDongGopInput,
  BoLocBaoLoiDongGopInput,
  ThongKeBaoLoi,
  TrangThaiBaoLoi,
} from '@lms/chung';

@Injectable()
export class KhoBaoLoiDongGopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async tao(idNguoiDung: string, duLieu: TaoBaoLoiDongGopInput) {
    return this.prisma.baoLoiDongGop.create({
      data: {
        idNguoiDung,
        tieuDe: duLieu.tieuDe,
        noiDung: duLieu.noiDung,
        loaiPhanHoi: duLieu.loaiPhanHoi,
        mucDoUuTien: duLieu.mucDoUuTien,
        anhDinhKem: duLieu.anhDinhKem,
        thongTinTrinhDuyet: duLieu.thongTinTrinhDuyet,
        trangThai: TrangThaiBaoLoi.CHO_TIEP_NHAN,
      },
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
      },
    });
  }

  async timTheoId(id: string) {
    return this.prisma.baoLoiDongGop.findUnique({
      where: { id },
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
        nguoiXuLy: {
          select: {
            id: true,
            hoTen: true,
            email: true,
          },
        },
      },
    });
  }

  private taoDieuKienLoc(boLoc: BoLocBaoLoiDongGopInput, idNguoiDung?: string) {
    const where: any = {};

    if (idNguoiDung) {
      where.idNguoiDung = idNguoiDung;
    }
    if (boLoc.loaiPhanHoi) {
      where.loaiPhanHoi = boLoc.loaiPhanHoi;
    }
    if (boLoc.trangThai) {
      where.trangThai = boLoc.trangThai;
    }
    if (boLoc.mucDoUuTien) {
      where.mucDoUuTien = boLoc.mucDoUuTien;
    }
    if (boLoc.tuKhoa) {
      where.OR = [
        { tieuDe: { contains: boLoc.tuKhoa, mode: 'insensitive' } },
        { noiDung: { contains: boLoc.tuKhoa, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async layDanhSach(boLoc: BoLocBaoLoiDongGopInput, idNguoiDung?: string) {
    const where = this.taoDieuKienLoc(boLoc, idNguoiDung);
    const boQua = (boLoc.trang - 1) * boLoc.kichThuoc;

    return this.prisma.baoLoiDongGop.findMany({
      where,
      skip: boQua,
      take: boLoc.kichThuoc,
      orderBy: { ngayTao: 'desc' },
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
        nguoiXuLy: {
          select: {
            id: true,
            hoTen: true,
            email: true,
          },
        },
      },
    });
  }

  async dem(boLoc: BoLocBaoLoiDongGopInput, idNguoiDung?: string): Promise<number> {
    const where = this.taoDieuKienLoc(boLoc, idNguoiDung);
    return this.prisma.baoLoiDongGop.count({ where });
  }

  async layThongKe(idNguoiDung?: string): Promise<ThongKeBaoLoi> {
    const where: any = {};
    if (idNguoiDung) where.idNguoiDung = idNguoiDung;

    const [tongSo, choTiepNhan, dangXuLy, daXuLy, tuChoi] = await Promise.all([
      this.prisma.baoLoiDongGop.count({ where }),
      this.prisma.baoLoiDongGop.count({
        where: { ...where, trangThai: TrangThaiBaoLoi.CHO_TIEP_NHAN },
      }),
      this.prisma.baoLoiDongGop.count({
        where: { ...where, trangThai: TrangThaiBaoLoi.DANG_XU_LY },
      }),
      this.prisma.baoLoiDongGop.count({
        where: { ...where, trangThai: TrangThaiBaoLoi.DA_XU_LY },
      }),
      this.prisma.baoLoiDongGop.count({
        where: { ...where, trangThai: TrangThaiBaoLoi.TU_CHOI },
      }),
    ]);

    return { tongSo, choTiepNhan, dangXuLy, daXuLy, tuChoi };
  }

  async capNhatXuLy(id: string, idNguoiXuLy: string, duLieu: XuLyBaoLoiDongGopInput) {
    return this.prisma.baoLoiDongGop.update({
      where: { id },
      data: {
        trangThai: duLieu.trangThai,
        phanHoiXuLy: duLieu.phanHoiXuLy,
        idNguoiXuLy,
      },
      include: {
        nguoiDung: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            vaiTro: true,
          },
        },
        nguoiXuLy: {
          select: {
            id: true,
            hoTen: true,
            email: true,
          },
        },
      },
    });
  }

  async xoa(id: string) {
    return this.prisma.baoLoiDongGop.delete({
      where: { id },
    });
  }
}
