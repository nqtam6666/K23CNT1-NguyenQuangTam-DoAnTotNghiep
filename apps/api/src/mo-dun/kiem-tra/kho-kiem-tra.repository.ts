import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  CheDoKiemTra,
  LoaiCauHoi,
  TrangThaiBaiKiemTra,
  TrangThaiLuotLam,
  TaoBaiKiemTraInput,
} from '@lms/chung';

@Injectable()
export class KhoKiemTraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSachTheoLop(idLopHocPhan: string, anBanNhap = false) {
    return this.prisma.baiKiemTra.findMany({
      where: {
        idLopHocPhan,
        ...(anBanNhap ? { trangThai: { not: TrangThaiBaiKiemTra.BAN_NHAP } } : {}),
      },
      include: {
        _count: {
          select: {
            cacCauHoi: true,
            cacLuotLam: true,
          },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async timTheoId(id: string) {
    return this.prisma.baiKiemTra.findUnique({
      where: { id },
      include: {
        lopHocPhan: {
          include: {
            monHoc: true,
            giaoVien: true,
          },
        },
        cacCauHoi: {
          orderBy: { thuTu: 'asc' },
        },
        _count: {
          select: {
            cacCauHoi: true,
            cacLuotLam: true,
          },
        },
      },
    });
  }

  async taoBaiKiemTra(idLopHocPhan: string, duLieu: TaoBaiKiemTraInput) {
    return this.prisma.baiKiemTra.create({
      data: {
        idLopHocPhan,
        tieuDe: duLieu.tieuDe,
        moTa: duLieu.moTa,
        cheDo: duLieu.cheDo as CheDoKiemTra,
        trangThai: duLieu.trangThai as TrangThaiBaiKiemTra,
        thoiGianLamPhut: duLieu.thoiGianLamPhut,
        soLuotToiDa: duLieu.soLuotToiDa,
        diemToiDa: duLieu.diemToiDa,
        tronCauHoi: duLieu.tronCauHoi,
        hienDapAnNgay: duLieu.hienDapAnNgay,
        hanKetThuc: duLieu.hanKetThuc ? new Date(duLieu.hanKetThuc) : null,
        cacCauHoi: {
          create: duLieu.danhSachCauHoi.map((ch, idx) => ({
            thuTu: ch.thuTu || idx + 1,
            noiDung: ch.noiDung,
            loaiCauHoi: (ch.loaiCauHoi || LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN) as LoaiCauHoi,
            cacPhuongAn: ch.cacPhuongAn as any,
            dapAnDung: ch.dapAnDung,
            giaiThich: ch.giaiThich,
            diemCau: ch.diemCau || 1.0,
          })),
        },
      },
      include: {
        cacCauHoi: {
          orderBy: { thuTu: 'asc' },
        },
        _count: {
          select: {
            cacCauHoi: true,
            cacLuotLam: true,
          },
        },
      },
    });
  }

  async capNhatTrangThai(id: string, trangThai: TrangThaiBaiKiemTra) {
    return this.prisma.baiKiemTra.update({
      where: { id },
      data: { trangThai },
    });
  }

  async xoaBaiKiemTra(id: string) {
    return this.prisma.baiKiemTra.delete({
      where: { id },
    });
  }

  async layLuotLamCuaHocSinh(idBaiKiemTra: string, idHocSinh: string) {
    return this.prisma.luotLamBai.findMany({
      where: {
        idBaiKiemTra,
        idHocSinh,
      },
      orderBy: { lanThu: 'desc' },
    });
  }

  async layLuotLamTheoDanhSachBai(danhSachIdBai: string[], idHocSinh: string) {
    if (danhSachIdBai.length === 0) return [];
    return this.prisma.luotLamBai.findMany({
      where: {
        idBaiKiemTra: { in: danhSachIdBai },
        idHocSinh,
      },
      orderBy: { thoiGianNop: 'desc' },
    });
  }

  async taoLuotLamBai(duLieu: {
    idBaiKiemTra: string;
    idHocSinh: string;
    lanThu: number;
    chiTietTraLoi: any;
    soCauDung: number;
    tongSoCau: number;
    diemSo: number;
    nhanXetAI: string;
    thoiLuongGiay: number;
  }) {
    const bayGio = new Date();
    const thoiGianBatDau = new Date(bayGio.getTime() - duLieu.thoiLuongGiay * 1000);

    return this.prisma.luotLamBai.create({
      data: {
        idBaiKiemTra: duLieu.idBaiKiemTra,
        idHocSinh: duLieu.idHocSinh,
        lanThu: duLieu.lanThu,
        trangThai: TrangThaiLuotLam.DA_CHAM,
        chiTietTraLoi: duLieu.chiTietTraLoi,
        soCauDung: duLieu.soCauDung,
        tongSoCau: duLieu.tongSoCau,
        diemSo: duLieu.diemSo,
        nhanXetAI: duLieu.nhanXetAI,
        thoiGianBatDau,
        thoiGianNop: bayGio,
        thoiLuongGiay: duLieu.thoiLuongGiay,
      },
    });
  }

  async layTatCaLuotLamTheoBai(idBaiKiemTra: string) {
    return this.prisma.luotLamBai.findMany({
      where: { idBaiKiemTra },
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
            lopHanhChinh: {
              select: {
                maLop: true,
                tenLop: true,
              },
            },
          },
        },
      },
      orderBy: [{ diemSo: 'desc' }, { thoiLuongGiay: 'asc' }],
    });
  }
}
