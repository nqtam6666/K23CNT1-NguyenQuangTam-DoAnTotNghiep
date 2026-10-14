import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  TrangThaiBuoiHoc,
  TrangThaiDiemDanh,
  TrangThaiDonXinNghi,
} from '@lms/chung';

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
   * Tìm buổi học theo ID
   */
  async timBuoiHocTheoId(idBuoiHoc: string) {
    return this.prisma.buoiHoc.findUnique({
      where: { id: idBuoiHoc },
      include: {
        lopHocPhan: {
          include: {
            giaoVien: true,
          },
        },
      },
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
   * Cập nhật mã điểm danh thông minh cho buổi học
   */
  async capNhatMaDiemDanh(
    idBuoiHoc: string,
    maDiemDanh: string | null,
    hanMaDiemDanh: Date | null,
  ) {
    return this.prisma.buoiHoc.update({
      where: { id: idBuoiHoc },
      data: {
        maDiemDanh,
        hanMaDiemDanh,
        trangThai: maDiemDanh ? TrangThaiBuoiHoc.DANG_DIEN_RA : undefined,
      },
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
                anhDaiDien: true,
              },
            },
          },
        },
      },
      orderBy: { hocSinh: { maHocSinh: 'asc' } },
    });
  }

  /**
   * Tạo đơn xin nghỉ phép
   */
  async taoDonXinNghi(
    idBuoiHoc: string,
    idNguoiDung: string,
    lyDo: string,
    minhChung?: string,
  ) {
    return this.prisma.donXinNghi.create({
      data: {
        idBuoiHoc,
        idNguoiDung,
        lyDo,
        minhChung,
      },
      include: {
        buoiHoc: {
          select: {
            id: true,
            chuDe: true,
            thoiGianBD: true,
            thoiGianKT: true,
          },
        },
        nguoiGui: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            hoSoHocSinh: {
              select: {
                id: true,
                maHocSinh: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Lấy danh sách đơn xin nghỉ của lớp học phần
   */
  async layDonXinNghiTheoLop(idLopHocPhan: string, idNguoiDungLoc?: string) {
    return this.prisma.donXinNghi.findMany({
      where: {
        buoiHoc: {
          idLopHocPhan,
        },
        ...(idNguoiDungLoc ? { idNguoiDung: idNguoiDungLoc } : {}),
      },
      include: {
        buoiHoc: {
          select: {
            id: true,
            chuDe: true,
            thoiGianBD: true,
            thoiGianKT: true,
          },
        },
        nguoiGui: {
          select: {
            id: true,
            hoTen: true,
            email: true,
            anhDaiDien: true,
            hoSoHocSinh: {
              select: {
                id: true,
                maHocSinh: true,
              },
            },
          },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  /**
   * Tìm đơn xin nghỉ theo ID
   */
  async timDonXinNghiTheoId(idDon: string) {
    return this.prisma.donXinNghi.findUnique({
      where: { id: idDon },
      include: {
        buoiHoc: {
          include: {
            lopHocPhan: {
              include: {
                giaoVien: true,
              },
            },
          },
        },
        nguoiGui: {
          include: {
            hoSoHocSinh: true,
          },
        },
      },
    });
  }

  /**
   * Cập nhật trạng thái duyệt đơn xin nghỉ
   */
  async capNhatDonXinNghi(
    idDon: string,
    trangThai: TrangThaiDonXinNghi,
    phanHoi?: string,
  ) {
    return this.prisma.donXinNghi.update({
      where: { id: idDon },
      data: {
        trangThai,
        phanHoi,
      },
    });
  }
}

