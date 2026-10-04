import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { KhoThoiKhoaBieuRepository } from './kho-thoi-khoa-bieu.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  TaoThoiKhoaBieuInput,
  CapNhatThoiKhoaBieuInput,
  TaoBuoiHocInput,
  CapNhatBuoiHocInput,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';

@Injectable()
export class DichVuThoiKhoaBieuService {
  constructor(
    private readonly khoThoiKhoaBieu: KhoThoiKhoaBieuRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // THỜI KHÓA BIỂU THEO LỚP
  // ==========================================

  async layThoiKhoaBieuTheoLop(idLopHocPhan: string) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
    });
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }
    return this.khoThoiKhoaBieu.layThoiKhoaBieuTheoLop(idLopHocPhan);
  }

  async taoThoiKhoaBieu(idLopHocPhan: string, duLieu: TaoThoiKhoaBieuInput) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: { hocKy: true },
    });
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    // 1. Kiểm tra xung đột phòng học nếu có chỉ định phòng
    if (duLieu.phongHoc) {
      const xungDotPhong = await this.khoThoiKhoaBieu.kiemTraXungDotPhong(
        duLieu.thuTrongTuan,
        duLieu.tietBatDau,
        duLieu.soTiet,
        duLieu.phongHoc,
        lop.idHocKy,
      );
      if (xungDotPhong) {
        throw new ConflictException(
          `Phòng ${duLieu.phongHoc} đã bị trùng lịch với lớp ${xungDotPhong.lopHocPhan.tenLopHocPhan} (Thứ ${xungDotPhong.thuTrongTuan}, Tiết ${xungDotPhong.tietBatDau})`,
        );
      }
    }

    // 2. Kiểm tra xung đột giáo viên
    const xungDotGV = await this.khoThoiKhoaBieu.kiemTraXungDotGiaoVien(
      lop.idGiaoVien,
      duLieu.thuTrongTuan,
      duLieu.tietBatDau,
      duLieu.soTiet,
      lop.idHocKy,
    );
    if (xungDotGV) {
      throw new ConflictException(
        `Giáo viên phụ trách đã có lịch dạy ở lớp ${xungDotGV.lopHocPhan.tenLopHocPhan} vào Thứ ${xungDotGV.thuTrongTuan}, Tiết ${xungDotGV.tietBatDau}`,
      );
    }

    return this.khoThoiKhoaBieu.taoThoiKhoaBieu(idLopHocPhan, duLieu);
  }

  async capNhatThoiKhoaBieu(id: string, duLieu: CapNhatThoiKhoaBieuInput) {
    const tkb = await this.khoThoiKhoaBieu.timThoiKhoaBieuTheoId(id);
    if (!tkb) {
      throw new NotFoundException('Không tìm thấy thời khóa biểu');
    }

    const thuTrongTuan = duLieu.thuTrongTuan ?? tkb.thuTrongTuan;
    const tietBatDau = duLieu.tietBatDau ?? tkb.tietBatDau;
    const soTiet = duLieu.soTiet ?? tkb.soTiet;
    const phongHoc = duLieu.phongHoc !== undefined ? duLieu.phongHoc : tkb.phongHoc;

    if (phongHoc) {
      const xungDotPhong = await this.khoThoiKhoaBieu.kiemTraXungDotPhong(
        thuTrongTuan,
        tietBatDau,
        soTiet,
        phongHoc,
        tkb.lopHocPhan.idHocKy,
        id,
      );
      if (xungDotPhong) {
        throw new ConflictException(
          `Phòng ${phongHoc} đã bị trùng lịch với lớp ${xungDotPhong.lopHocPhan.tenLopHocPhan}`,
        );
      }
    }

    const xungDotGV = await this.khoThoiKhoaBieu.kiemTraXungDotGiaoVien(
      tkb.lopHocPhan.idGiaoVien,
      thuTrongTuan,
      tietBatDau,
      soTiet,
      tkb.lopHocPhan.idHocKy,
      id,
    );
    if (xungDotGV) {
      throw new ConflictException(
        `Giáo viên phụ trách đã có lịch dạy ở lớp khác vào khung giờ này`,
      );
    }

    return this.khoThoiKhoaBieu.capNhatThoiKhoaBieu(id, duLieu);
  }

  async xoaThoiKhoaBieu(id: string) {
    const tkb = await this.khoThoiKhoaBieu.timThoiKhoaBieuTheoId(id);
    if (!tkb) {
      throw new NotFoundException('Không tìm thấy thời khóa biểu');
    }
    return this.khoThoiKhoaBieu.xoaThoiKhoaBieu(id);
  }

  // ==========================================
  // SINH BUỔI HỌC TỰ ĐỘNG THEO LỊCH HỌC KỲ
  // ==========================================

  async sinhBuoiHocTheoThoiKhoaBieu(idLopHocPhan: string) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        hocKy: true,
        cacThoiKhoaBieu: true,
      },
    });

    if (!lop) throw new NotFoundException('Không tìm thấy lớp học phần');
    if (lop.cacThoiKhoaBieu.length === 0) {
      throw new BadRequestException('Lớp học phần chưa có thời khóa biểu tuần nào để sinh buổi học');
    }

    const ngayBatDau = new Date(lop.hocKy.ngayBatDau);
    const ngayKetThuc = new Date(lop.hocKy.ngayKetThuc);

    // Mốc giờ theo tiết học tiêu chuẩn
    // Tiết 1: 07:00, mỗi tiết 45 phút, giải lao 5 phút
    const gioBatDauTheoTiet: Record<number, { gio: number; phut: number }> = {
      1: { gio: 7, phut: 0 },
      2: { gio: 7, phut: 50 },
      3: { gio: 8, phut: 40 },
      4: { gio: 9, phut: 35 },
      5: { gio: 10, phut: 25 },
      6: { gio: 13, phut: 0 },
      7: { gio: 13, phut: 50 },
      8: { gio: 14, phut: 40 },
      9: { gio: 15, phut: 35 },
      10: { gio: 16, phut: 25 },
    };

    const danhSachBuoiHocData: Array<{
      idLopHocPhan: string;
      chuDe: string;
      thoiGianBD: Date;
      thoiGianKT: Date;
    }> = [];

    // Duyệt qua từng ngày trong khoảng thời gian học kỳ
    const curr = new Date(ngayBatDau);
    let sttBuoi = 1;

    while (curr <= ngayKetThuc) {
      // JavaScript: Sunday = 0, Monday = 1, ..., Saturday = 6
      // Quy ước của chúng ta: 2 (Thứ 2) -> 8 (Chủ nhật)
      const jsDay = curr.getDay();
      const thuQuyUoc = jsDay === 0 ? 8 : jsDay + 1;

      // Tìm thời khóa biểu ứng với thứ này
      const tkbKhop = lop.cacThoiKhoaBieu.filter((tkb) => tkb.thuTrongTuan === thuQuyUoc);

      for (const tkb of tkbKhop) {
        const gioMoc = gioBatDauTheoTiet[tkb.tietBatDau] || { gio: 7, phut: 0 };
        const bd = new Date(curr);
        bd.setHours(gioMoc.gio, gioMoc.phut, 0, 0);

        // Mỗi tiết tính 45 phút
        const tongPhut = tkb.soTiet * 45;
        const kt = new Date(bd.getTime() + tongPhut * 60 * 1000);

        danhSachBuoiHocData.push({
          idLopHocPhan,
          chuDe: `Buổi ${sttBuoi}: Bài học theo thời khóa biểu`,
          thoiGianBD: bd,
          thoiGianKT: kt,
        });

        sttBuoi++;
      }

      // Tăng thêm 1 ngày
      curr.setDate(curr.getDate() + 1);
    }

    if (danhSachBuoiHocData.length > 0) {
      await this.prisma.buoiHoc.createMany({
        data: danhSachBuoiHocData,
      });
    }

    return {
      thongBao: `Đã tự động sinh ${danhSachBuoiHocData.length} buổi học cho lớp ${lop.tenLopHocPhan}`,
      tongSoBuoi: danhSachBuoiHocData.length,
    };
  }

  // ==========================================
  // BUỔI HỌC
  // ==========================================

  async layDanhSachBuoiHoc(idLopHocPhan: string) {
    return this.khoThoiKhoaBieu.layDanhSachBuoiHocTheoLop(idLopHocPhan);
  }

  async taoBuoiHoc(duLieu: TaoBuoiHocInput) {
    return this.khoThoiKhoaBieu.taoBuoiHoc(duLieu);
  }

  async capNhatBuoiHoc(id: string, duLieu: CapNhatBuoiHocInput) {
    const buoiHoc = await this.khoThoiKhoaBieu.timBuoiHocTheoId(id);
    if (!buoiHoc) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }
    return this.khoThoiKhoaBieu.capNhatBuoiHoc(id, duLieu);
  }

  async xoaBuoiHoc(id: string) {
    const buoiHoc = await this.khoThoiKhoaBieu.timBuoiHocTheoId(id);
    if (!buoiHoc) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }
    return this.khoThoiKhoaBieu.xoaBuoiHoc(id);
  }

  // ==========================================
  // THỜI KHÓA BIỂU CÁ NHÂN THEO VAI TRÒ
  // ==========================================

  async layThoiKhoaBieuCaNhan(nguoiDung: PayloadJwt, idHocKy?: string) {
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) return [];
      return this.khoThoiKhoaBieu.layThoiKhoaBieuGiaoVien(hoSo.id, idHocKy);
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) return [];
      return this.khoThoiKhoaBieu.layThoiKhoaBieuHocSinh(hoSo.id, idHocKy);
    }

    if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: nguoiDung.sub },
        select: { idHocSinh: true },
      });
      const danhSachIdCon = lienKet.map((lk) => lk.idHocSinh);
      return this.prisma.thoiKhoaBieu.findMany({
        where: {
          lopHocPhan: {
            idHocKy: idHocKy ? idHocKy : undefined,
            danhSachGhiDanh: {
              some: { idHocSinh: { in: danhSachIdCon } },
            },
          },
        },
        include: {
          lopHocPhan: {
            include: {
              monHoc: true,
              giaoVien: { include: { nguoiDung: true } },
            },
          },
        },
        orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
      });
    }

    // Với Admin / Giáo vụ: trả về toàn bộ
    return this.prisma.thoiKhoaBieu.findMany({
      where: idHocKy ? { lopHocPhan: { idHocKy } } : undefined,
      include: {
        lopHocPhan: {
          include: {
            monHoc: true,
            giaoVien: { include: { nguoiDung: true } },
          },
        },
      },
      orderBy: [{ thuTrongTuan: 'asc' }, { tietBatDau: 'asc' }],
    });
  }
}
