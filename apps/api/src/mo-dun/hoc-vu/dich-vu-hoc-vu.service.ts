import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { KhoHocVuRepository } from './kho-hoc-vu.repository';
import {
  TaoNamHocInput,
  CapNhatNamHocInput,
  TaoHocKyInput,
  CapNhatHocKyInput,
  TaoMonHocInput,
  CapNhatMonHocInput,
  TruyVanMonHocInput,
  TaoLopHanhChinhInput,
  CapNhatLopHanhChinhInput,
  TruyVanLopHanhChinhInput,
} from '@lms/chung';

@Injectable()
export class DichVuHocVuService {
  constructor(private readonly khoHocVu: KhoHocVuRepository) {}

  // ==========================================
  // NĂM HỌC
  // ==========================================

  async layDanhSachNamHoc() {
    return this.khoHocVu.layDanhSachNamHoc();
  }

  async layChiTietNamHoc(id: string) {
    const namHoc = await this.khoHocVu.timNamHocTheoId(id);
    if (!namHoc) {
      throw new NotFoundException('Không tìm thấy năm học');
    }
    return namHoc;
  }

  async taoNamHoc(duLieu: TaoNamHocInput) {
    const daTonTai = await this.khoHocVu.timNamHocTheoTen(duLieu.tenNamHoc);
    if (daTonTai) {
      throw new ConflictException(`Năm học ${duLieu.tenNamHoc} đã tồn tại`);
    }
    return this.khoHocVu.taoNamHoc(duLieu);
  }

  async capNhatNamHoc(id: string, duLieu: CapNhatNamHocInput) {
    await this.layChiTietNamHoc(id);

    if (duLieu.tenNamHoc) {
      const daTonTai = await this.khoHocVu.timNamHocTheoTen(duLieu.tenNamHoc);
      if (daTonTai && daTonTai.id !== id) {
        throw new ConflictException(`Năm học ${duLieu.tenNamHoc} đã tồn tại`);
      }
    }

    return this.khoHocVu.capNhatNamHoc(id, duLieu);
  }

  async xoaNamHoc(id: string) {
    const namHoc = await this.layChiTietNamHoc(id);
    if (namHoc.cacHocKy && namHoc.cacHocKy.length > 0) {
      throw new BadRequestException('Không thể xóa năm học đang chứa các học kỳ');
    }
    return this.khoHocVu.xoaNamHoc(id);
  }

  // ==========================================
  // HỌC KỲ
  // ==========================================

  async layDanhSachHocKy(idNamHoc?: string) {
    return this.khoHocVu.layDanhSachHocKyTheoNam(idNamHoc);
  }

  async layChiTietHocKy(id: string) {
    const hocKy = await this.khoHocVu.timHocKyTheoId(id);
    if (!hocKy) {
      throw new NotFoundException('Không tìm thấy học kỳ');
    }
    return hocKy;
  }

  async taoHocKy(duLieu: TaoHocKyInput) {
    await this.layChiTietNamHoc(duLieu.idNamHoc);
    return this.khoHocVu.taoHocKy(duLieu);
  }

  async capNhatHocKy(id: string, duLieu: CapNhatHocKyInput) {
    await this.layChiTietHocKy(id);
    if (duLieu.idNamHoc) {
      await this.layChiTietNamHoc(duLieu.idNamHoc);
    }
    return this.khoHocVu.capNhatHocKy(id, duLieu);
  }

  async xoaHocKy(id: string) {
    await this.layChiTietHocKy(id);
    return this.khoHocVu.xoaHocKy(id);
  }

  // ==========================================
  // MÔN HỌC
  // ==========================================

  async layDanhSachMonHoc(truyVan: TruyVanMonHocInput) {
    const { danhSach, tongSo } = await this.khoHocVu.layDanhSachMonHoc(truyVan);
    return {
      duLieu: danhSach,
      tongSo,
      trang: truyVan.trang,
      kichThuoc: truyVan.kichThuoc,
      tongSoTrang: Math.ceil(tongSo / truyVan.kichThuoc),
    };
  }

  async layChiTietMonHoc(id: string) {
    const monHoc = await this.khoHocVu.timMonHocTheoId(id);
    if (!monHoc) {
      throw new NotFoundException('Không tìm thấy môn học');
    }
    return monHoc;
  }

  async taoMonHoc(duLieu: TaoMonHocInput) {
    const daTonTai = await this.khoHocVu.timMonHocTheoMa(duLieu.maMonHoc);
    if (daTonTai) {
      throw new ConflictException(`Mã môn học ${duLieu.maMonHoc} đã tồn tại`);
    }
    return this.khoHocVu.taoMonHoc(duLieu);
  }

  async capNhatMonHoc(id: string, duLieu: CapNhatMonHocInput) {
    await this.layChiTietMonHoc(id);
    if (duLieu.maMonHoc) {
      const daTonTai = await this.khoHocVu.timMonHocTheoMa(duLieu.maMonHoc);
      if (daTonTai && daTonTai.id !== id) {
        throw new ConflictException(`Mã môn học ${duLieu.maMonHoc} đã tồn tại`);
      }
    }
    return this.khoHocVu.capNhatMonHoc(id, duLieu);
  }

  async xoaMonHoc(id: string) {
    await this.layChiTietMonHoc(id);
    return this.khoHocVu.xoaMonHoc(id);
  }

  // ==========================================
  // LỚP HÀNH CHÍNH
  // ==========================================

  async layDanhSachLopHanhChinh(truyVan: TruyVanLopHanhChinhInput) {
    const { danhSach, tongSo } = await this.khoHocVu.layDanhSachLopHanhChinh(truyVan);
    return {
      duLieu: danhSach,
      tongSo,
      trang: truyVan.trang,
      kichThuoc: truyVan.kichThuoc,
      tongSoTrang: Math.ceil(tongSo / truyVan.kichThuoc),
    };
  }

  async layChiTietLopHanhChinh(id: string) {
    const lop = await this.khoHocVu.timLopHanhChinhTheoId(id);
    if (!lop) {
      throw new NotFoundException('Không tìm thấy lớp hành chính');
    }
    return lop;
  }

  async taoLopHanhChinh(duLieu: TaoLopHanhChinhInput) {
    const daTonTai = await this.khoHocVu.timLopHanhChinhTheoMa(duLieu.maLop);
    if (daTonTai) {
      throw new ConflictException(`Mã lớp ${duLieu.maLop} đã tồn tại`);
    }
    return this.khoHocVu.taoLopHanhChinh(duLieu);
  }

  async capNhatLopHanhChinh(id: string, duLieu: CapNhatLopHanhChinhInput) {
    await this.layChiTietLopHanhChinh(id);
    if (duLieu.maLop) {
      const daTonTai = await this.khoHocVu.timLopHanhChinhTheoMa(duLieu.maLop);
      if (daTonTai && daTonTai.id !== id) {
        throw new ConflictException(`Mã lớp ${duLieu.maLop} đã tồn tại`);
      }
    }
    return this.khoHocVu.capNhatLopHanhChinh(id, duLieu);
  }

  async xoaLopHanhChinh(id: string) {
    await this.layChiTietLopHanhChinh(id);
    return this.khoHocVu.xoaLopHanhChinh(id);
  }
}
