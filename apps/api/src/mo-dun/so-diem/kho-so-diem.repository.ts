import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { CapNhatDiemSoInput } from '@lms/chung';

@Injectable()
export class KhoSoDiemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layCotDiemTheoLop(idLopHocPhan: string) {
    return this.prisma.cotDiem.findMany({
      where: { idLopHocPhan },
      include: {
        danhSachDiem: true,
      },
      orderBy: { ngayTao: 'asc' },
    });
  }

  async taoCotDiem(idLopHocPhan: string, tenCotDiem: string, heSo: number) {
    return this.prisma.cotDiem.create({
      data: {
        idLopHocPhan,
        tenCotDiem,
        heSo,
      },
    });
  }

  async timCotDiemTheoId(idCotDiem: string) {
    return this.prisma.cotDiem.findUnique({
      where: { id: idCotDiem },
      include: {
        lopHocPhan: {
          include: {
            giaoVien: true,
          },
        },
      },
    });
  }

  async xoaCotDiem(idCotDiem: string) {
    return this.prisma.cotDiem.delete({
      where: { id: idCotDiem },
    });
  }

  async capNhatDiemSo(duLieu: CapNhatDiemSoInput) {
    return this.prisma.diemSo.upsert({
      where: {
        idCotDiem_idHocSinh: {
          idCotDiem: duLieu.idCotDiem,
          idHocSinh: duLieu.idHocSinh,
        },
      },
      update: {
        giaTri: duLieu.giaTri,
        ghiChu: duLieu.ghiChu,
      },
      create: {
        idCotDiem: duLieu.idCotDiem,
        idHocSinh: duLieu.idHocSinh,
        giaTri: duLieu.giaTri,
        ghiChu: duLieu.ghiChu,
      },
    });
  }

  async luuDiemHangLoat(danhSach: CapNhatDiemSoInput[]) {
    return this.prisma.$transaction(
      danhSach.map((muc) =>
        this.prisma.diemSo.upsert({
          where: {
            idCotDiem_idHocSinh: {
              idCotDiem: muc.idCotDiem,
              idHocSinh: muc.idHocSinh,
            },
          },
          update: {
            giaTri: muc.giaTri,
            ghiChu: muc.ghiChu,
          },
          create: {
            idCotDiem: muc.idCotDiem,
            idHocSinh: muc.idHocSinh,
            giaTri: muc.giaTri,
            ghiChu: muc.ghiChu,
          },
        }),
      ),
    );
  }
}
