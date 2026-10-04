import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { TrangThaiBuoiHoc, TrangThaiDiemDanh } from '@lms/chung';

@Injectable()
export class KhoPhongHoc {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tìm phòng học trực tuyến theo ID lớp học phần
   */
  async timPhongTheoLop(idLopHocPhan: string) {
    return this.prisma.phongTrucTuyen.findUnique({
      where: { idLopHocPhan },
      include: {
        lopHocPhan: {
          include: {
            giaoVien: {
              include: {
                nguoiDung: {
                  select: {
                    id: true,
                    hoTen: true,
                    email: true,
                  },
                },
              },
            },
            monHoc: true,
            hocKy: true,
          },
        },
      },
    });
  }

  /**
   * Tìm phòng trực tuyến theo tên phòng (LiveKit room name)
   */
  async timTheoTenPhong(tenPhong: string) {
    return this.prisma.phongTrucTuyen.findUnique({
      where: { tenPhong },
      include: {
        lopHocPhan: true,
      },
    });
  }

  /**
   * Khởi tạo phòng trực tuyến mới nếu chưa có
   */
  async taoPhong(idLopHocPhan: string, tenPhong: string, dangMo = false) {
    return this.prisma.phongTrucTuyen.upsert({
      where: { idLopHocPhan },
      update: {
        dangMo,
      },
      create: {
        idLopHocPhan,
        tenPhong,
        dangMo,
      },
    });
  }

  /**
   * Cập nhật trạng thái mở / đóng phòng học
   */
  async capNhatTrangThai(idPhong: string, dangMo: boolean) {
    return this.prisma.phongTrucTuyen.update({
      where: { id: idPhong },
      data: { dangMo },
    });
  }

  /**
   * Tìm buổi học đang diễn ra hoặc buổi học của ngày hôm nay
   */
  async timBuoiHocHienTai(idLopHocPhan: string) {
    const bayGio = new Date();
    // 1. Ưu tiên tìm buổi đang diễn ra
    const buoiDangDienRa = await this.prisma.buoiHoc.findFirst({
      where: {
        idLopHocPhan,
        trangThai: TrangThaiBuoiHoc.DANG_DIEN_RA,
      },
      orderBy: { thoiGianBD: 'desc' },
    });

    if (buoiDangDienRa) return buoiDangDienRa;

    // 2. Tìm buổi học gần nhất trong ngày hôm nay
    const dauNgay = new Date(bayGio.getFullYear(), bayGio.getMonth(), bayGio.getDate(), 0, 0, 0);
    const cuoiNgay = new Date(
      bayGio.getFullYear(),
      bayGio.getMonth(),
      bayGio.getDate(),
      23,
      59,
      59,
    );

    return this.prisma.buoiHoc.findFirst({
      where: {
        idLopHocPhan,
        thoiGianBD: { gte: dauNgay, lte: cuoiNgay },
      },
      orderBy: { thoiGianBD: 'asc' },
    });
  }

  /**
   * Cập nhật trạng thái buổi học
   */
  async capNhatTrangThaiBuoiHoc(idBuoiHoc: string, trangThai: TrangThaiBuoiHoc) {
    return this.prisma.buoiHoc.update({
      where: { id: idBuoiHoc },
      data: { trangThai },
    });
  }

  /**
   * Ghi nhận người dùng vào phòng học (Bắt đầu tham gia)
   */
  async ghiNhatKyVao(idBuoiHoc: string, idNguoiDung: string) {
    return this.prisma.nhatKyThamGia.create({
      data: {
        idBuoiHoc,
        idNguoiDung,
        thoiGianVao: new Date(),
      },
    });
  }

  /**
   * Ghi nhận người dùng rời phòng học và tính tổng thời lượng
   */
  async ghiNhatKyRoi(idBuoiHoc: string, idNguoiDung: string) {
    // Tìm bản ghi vào gần nhất mà chưa có thời gian ra
    const banGhiVao = await this.prisma.nhatKyThamGia.findFirst({
      where: {
        idBuoiHoc,
        idNguoiDung,
        thoiGianRa: null,
      },
      orderBy: { thoiGianVao: 'desc' },
    });

    if (!banGhiVao) return null;

    const thoiGianRa = new Date();
    const thoiLuongGiay = Math.max(
      0,
      Math.floor((thoiGianRa.getTime() - banGhiVao.thoiGianVao.getTime()) / 1000),
    );

    return this.prisma.nhatKyThamGia.update({
      where: { id: banGhiVao.id },
      data: {
        thoiGianRa,
        thoiLuongGiay,
      },
    });
  }

  /**
   * Lấy danh sách nhật ký tham gia của một buổi học
   */
  async layNhatKyTheoBuoi(idBuoiHoc: string) {
    return this.prisma.nhatKyThamGia.findMany({
      where: { idBuoiHoc },
      include: {
        buoiHoc: {
          select: {
            id: true,
            chuDe: true,
            thoiGianBD: true,
            thoiGianKT: true,
            trangThai: true,
          },
        },
      },
      orderBy: { thoiGianVao: 'desc' },
    });
  }

  /**
   * Điểm danh học sinh (hoặc cập nhật trạng thái điểm danh)
   */
  async diemDanhHocSinh(
    idBuoiHoc: string,
    idHocSinh: string,
    trangThai: TrangThaiDiemDanh,
    ghiChu?: string,
  ) {
    return this.prisma.banGhiDiemDanh.upsert({
      where: {
        idBuoiHoc_idHocSinh: {
          idBuoiHoc,
          idHocSinh,
        },
      },
      update: {
        trangThai,
        ghiChu,
        ngayDiemDanh: new Date(),
      },
      create: {
        idBuoiHoc,
        idHocSinh,
        trangThai,
        ghiChu,
      },
    });
  }

  /**
   * Lấy danh sách điểm danh của buổi học kèm thông tin học sinh
   */
  async layDanhSachDiemDanh(idBuoiHoc: string) {
    return this.prisma.banGhiDiemDanh.findMany({
      where: { idBuoiHoc },
      include: {
        hocSinh: {
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
      },
      orderBy: { hocSinh: { maHocSinh: 'asc' } },
    });
  }
}
