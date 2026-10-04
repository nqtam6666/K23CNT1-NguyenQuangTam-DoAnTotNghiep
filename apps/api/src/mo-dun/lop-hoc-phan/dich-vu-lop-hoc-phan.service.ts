import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { KhoLopHocPhanRepository } from './kho-lop-hoc-phan.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  TaoLopHocPhanInput,
  CapNhatLopHocPhanInput,
  TruyVanLopHocPhanInput,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';
import * as crypto from 'crypto';

@Injectable()
export class DichVuLopHocPhanService {
  constructor(
    private readonly khoLopHocPhan: KhoLopHocPhanRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // HÀM TIỆN ÍCH SINH MÃ THAM GIA
  // ==========================================

  private sinhMaThamGia(): string {
    // Sinh mã 6 ký tự gồm chữ hoa và số
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  // ==========================================
  // LỚP HỌC PHẦN
  // ==========================================

  async layDanhSachLopHocPhan(truyVan: TruyVanLopHocPhanInput, nguoiDung: PayloadJwt) {
    // Nếu là Học sinh: chỉ lấy các lớp mình đã ghi danh
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) return { duLieu: [], tongSo: 0, trang: 1, kichThuoc: 10, tongSoTrang: 0 };
      const danhSach = await this.khoLopHocPhan.layLopHocPhanTheoHocSinh(hoSo.id);
      return {
        duLieu: danhSach,
        tongSo: danhSach.length,
        trang: 1,
        kichThuoc: danhSach.length,
        tongSoTrang: 1,
      };
    }

    // Nếu là Giáo viên: nếu không có bộ lọc giáo viên cụ thể, mặc định có thể xem lớp mình dạy
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN && !truyVan.idGiaoVien) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (hoSo) {
        truyVan.idGiaoVien = hoSo.id;
      }
    }

    const { danhSach, tongSo } = await this.khoLopHocPhan.layDanhSachLopHocPhan(truyVan);
    return {
      duLieu: danhSach,
      tongSo,
      trang: truyVan.trang,
      kichThuoc: truyVan.kichThuoc,
      tongSoTrang: Math.ceil(tongSo / truyVan.kichThuoc),
    };
  }

  async layChiTietLopHocPhan(id: string, nguoiDung: PayloadJwt) {
    const lop = await this.khoLopHocPhan.timLopHocPhanTheoId(id);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    // Kiểm tra quyền sở hữu ABAC chống IDOR:
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) {
        throw new ForbiddenException('Bạn chưa có hồ sơ học sinh');
      }
      const daGhiDanh = await this.khoLopHocPhan.kiemTraGhiDanh(id, hoSo.id);
      if (!daGhiDanh) {
        throw new ForbiddenException('Bạn chưa được ghi danh vào lớp học phần này');
      }
    } else if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: nguoiDung.sub },
        select: { idHocSinh: true },
      });
      const danhSachIdCon = lienKet.map((lk) => lk.idHocSinh);
      const coConHocLopNay = await this.prisma.ghiDanh.findFirst({
        where: {
          idLopHocPhan: id,
          idHocSinh: { in: danhSachIdCon },
        },
      });
      if (!coConHocLopNay) {
        throw new ForbiddenException('Con em của bạn không theo học lớp học phần này');
      }
    }

    return lop;
  }

  async taoLopHocPhan(duLieu: TaoLopHocPhanInput) {
    const daTonTai = await this.khoLopHocPhan.timLopHocPhanTheoMa(duLieu.maLopHocPhan);
    if (daTonTai) {
      throw new ConflictException(`Mã lớp học phần ${duLieu.maLopHocPhan} đã tồn tại`);
    }

    let maThamGia = this.sinhMaThamGia();
    // Đảm bảo mã tham gia không trùng
    let loop = 0;
    while (await this.khoLopHocPhan.timLopHocPhanTheoMaThamGia(maThamGia)) {
      maThamGia = this.sinhMaThamGia();
      loop++;
      if (loop > 10) break;
    }

    return this.khoLopHocPhan.taoLopHocPhan({
      ...duLieu,
      maThamGia,
    });
  }

  async capNhatLopHocPhan(id: string, duLieu: CapNhatLopHocPhanInput, nguoiDung: PayloadJwt) {
    const lop = await this.khoLopHocPhan.timLopHocPhanTheoId(id);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    // Nếu là Giáo viên: chỉ sửa được nếu là giáo viên phụ trách lớp
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo || lop.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa lớp học phần của giáo viên khác',
        );
      }
    }

    if (duLieu.maLopHocPhan && duLieu.maLopHocPhan !== lop.maLopHocPhan) {
      const daTonTai = await this.khoLopHocPhan.timLopHocPhanTheoMa(duLieu.maLopHocPhan);
      if (daTonTai) {
        throw new ConflictException(`Mã lớp học phần ${duLieu.maLopHocPhan} đã tồn tại`);
      }
    }

    return this.khoLopHocPhan.capNhatLopHocPhan(id, duLieu);
  }

  async xoaLopHocPhan(id: string) {
    const lop = await this.khoLopHocPhan.timLopHocPhanTheoId(id);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }
    return this.khoLopHocPhan.xoaLopHocPhan(id);
  }

  // ==========================================
  // GHI DANH HỌC SINH
  // ==========================================

  async layDanhSachGhiDanh(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.layChiTietLopHocPhan(idLopHocPhan, nguoiDung);
    return this.khoLopHocPhan.layDanhSachGhiDanh(idLopHocPhan);
  }

  async ghiDanhHocSinh(idLopHocPhan: string, idHocSinh: string) {
    const lop = await this.khoLopHocPhan.timLopHocPhanTheoId(idLopHocPhan);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    const daGhiDanh = await this.khoLopHocPhan.kiemTraGhiDanh(idLopHocPhan, idHocSinh);
    if (daGhiDanh) {
      throw new ConflictException('Học sinh này đã được ghi danh vào lớp học phần');
    }

    return this.khoLopHocPhan.taoGhiDanh(idLopHocPhan, idHocSinh);
  }

  async ghiDanhNhieuHocSinh(idLopHocPhan: string, danhSachIdHocSinh: string[]) {
    const lop = await this.khoLopHocPhan.timLopHocPhanTheoId(idLopHocPhan);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp học phần');
    }

    return this.khoLopHocPhan.taoGhiDanhNhieu(idLopHocPhan, danhSachIdHocSinh);
  }

  async ghiDanhTheoLopHanhChinh(idLopHocPhan: string, idLopHanhChinh: string) {
    const hocSinhs = await this.khoLopHocPhan.layDanhSachHocSinhTheoLopHanhChinh(idLopHanhChinh);
    if (hocSinhs.length === 0) {
      throw new BadRequestException('Lớp hành chính này chưa có học sinh nào');
    }

    const danhSachIdHocSinh = hocSinhs.map((hs) => hs.id);
    return this.khoLopHocPhan.taoGhiDanhNhieu(idLopHocPhan, danhSachIdHocSinh);
  }

  async xoaGhiDanh(idLopHocPhan: string, idHocSinh: string) {
    const daGhiDanh = await this.khoLopHocPhan.kiemTraGhiDanh(idLopHocPhan, idHocSinh);
    if (!daGhiDanh) {
      throw new NotFoundException('Học sinh chưa có trong danh sách ghi danh của lớp này');
    }

    return this.khoLopHocPhan.xoaGhiDanh(idLopHocPhan, idHocSinh);
  }

  async thamGiaBangMa(maThamGia: string, nguoiDung: PayloadJwt) {
    const hoSo = await this.prisma.hoSoHocSinh.findUnique({
      where: { idNguoiDung: nguoiDung.sub },
    });
    if (!hoSo) {
      throw new ForbiddenException('Chỉ tài khoản học sinh mới có thể tham gia bằng mã');
    }

    const lop = await this.khoLopHocPhan.timLopHocPhanTheoMaThamGia(maThamGia);
    if (!lop) {
      throw new NotFoundException('Mã tham gia lớp học không hợp lệ hoặc không tồn tại');
    }

    if (!lop.kichHoat) {
      throw new BadRequestException('Lớp học phần này hiện đang bị khóa');
    }

    const daGhiDanh = await this.khoLopHocPhan.kiemTraGhiDanh(lop.id, hoSo.id);
    if (daGhiDanh) {
      throw new ConflictException('Bạn đã tham gia lớp học phần này từ trước');
    }

    await this.khoLopHocPhan.taoGhiDanh(lop.id, hoSo.id);
    return {
      thongBao: `Tham gia lớp học phần ${lop.tenLopHocPhan} thành công`,
      lopHocPhan: lop,
    };
  }
}
