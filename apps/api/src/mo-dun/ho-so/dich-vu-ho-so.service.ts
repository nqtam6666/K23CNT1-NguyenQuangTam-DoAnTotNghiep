import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  CapNhatHoSoDto,
  TaoHoSoHocSinhDto,
  CapNhatHoSoHocSinhDto,
  TruyVanHoSoHocSinhDto,
  TaoHoSoGiaoVienDto,
  CapNhatHoSoGiaoVienDto,
  ThietLapLienKetPhuHuynhDto,
  TruyVanPhanTrangDto,
  MaLoiNghiepVu,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';
import { KhoHoSo } from './kho-ho-so.repository';
import { KhoNguoiDung } from '../nguoi-dung/kho-nguoi-dung.repository';

@Injectable()
export class DichVuHoSo {
  constructor(
    private readonly khoHoSo: KhoHoSo,
    private readonly khoNguoiDung: KhoNguoiDung,
  ) {}

  /**
   * Lấy toàn bộ thông tin hồ sơ của người dùng đang đăng nhập
   */
  async layHoSoCaNhan(idNguoiDung: string, vaiTro: VaiTro) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung, true);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const { matKhau, ...duLieu } = nguoiDung;

    if (vaiTro === VaiTro.HOC_SINH) {
      const hoSoHocSinh = await this.khoHoSo.timHoSoHocSinhTheoIdNguoiDung(idNguoiDung);
      return { ...duLieu, hoSoHocSinh };
    }

    if (vaiTro === VaiTro.GIAO_VIEN) {
      const hoSoGiaoVien = await this.khoHoSo.timHoSoGiaoVienTheoIdNguoiDung(idNguoiDung);
      return { ...duLieu, hoSoGiaoVien };
    }

    if (vaiTro === VaiTro.PHU_HUYNH) {
      const danhSachConEm = await this.khoHoSo.layDanhSachConEmCuaPhuHuynh(idNguoiDung);
      return { ...duLieu, danhSachConEm };
    }

    return duLieu;
  }

  /**
   * Cập nhật thông tin cá nhân cơ bản (số điện thoại, họ tên, ảnh đại diện)
   */
  async capNhatHoSoCaNhan(idNguoiDung: string, duLieu: CapNhatHoSoDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const capNhat = await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {
      hoTen: duLieu.hoTen,
      soDienThoai: duLieu.soDienThoai,
      anhDaiDien: duLieu.anhDaiDien,
    });

    const { matKhau, ...ketQua } = capNhat;
    return ketQua;
  }

  // ==================== NGHIỆP VỤ HỌC SINH ====================

  async layDanhSachHocSinh(thamSo: TruyVanHoSoHocSinhDto) {
    return this.khoHoSo.timDanhSachHocSinh(thamSo);
  }

  async layChiTietHocSinh(id: string, nguoiDungHienTai: PayloadJwt) {
    const hoSo = await this.khoHoSo.timHoSoHocSinhTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    // CHỐNG IDOR (Rule 02 - Insecure Direct Object References)
    if (nguoiDungHienTai.vaiTro === VaiTro.HOC_SINH) {
      if (hoSo.idNguoiDung !== nguoiDungHienTai.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Học sinh chỉ được phép xem hồ sơ của chính mình',
        });
      }
    } else if (nguoiDungHienTai.vaiTro === VaiTro.PHU_HUYNH) {
      const coLienKet = await this.khoHoSo.kiemTraLienKet(nguoiDungHienTai.id, hoSo.id);
      if (!coLienKet) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn chỉ được phép xem thông tin hồ sơ của con em mình',
        });
      }
    }

    return hoSo;
  }

  async taoHoSoHocSinh(duLieu: TaoHoSoHocSinhDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(duLieu.idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Người dùng không tồn tại',
      });
    }

    const daCoHoSo = await this.khoHoSo.timHoSoHocSinhTheoIdNguoiDung(duLieu.idNguoiDung);
    if (daCoHoSo) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Người dùng này đã có hồ sơ học sinh',
      });
    }

    const daTonTaiMa = await this.khoHoSo.timHoSoHocSinhTheoMa(duLieu.maHocSinh);
    if (daTonTaiMa) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Mã học sinh này đã được sử dụng',
      });
    }

    return this.khoHoSo.taoHoSoHocSinh({
      nguoiDung: { connect: { id: duLieu.idNguoiDung } },
      maHocSinh: duLieu.maHocSinh,
      lopHanhChinh: duLieu.idLopHanhChinh ? { connect: { id: duLieu.idLopHanhChinh } } : undefined,
      ngaySinh: duLieu.ngaySinh ? new Date(duLieu.ngaySinh) : undefined,
      diaChi: duLieu.diaChi,
    });
  }

  async capNhatHoSoHocSinh(id: string, duLieu: CapNhatHoSoHocSinhDto) {
    const hoSo = await this.khoHoSo.timHoSoHocSinhTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    if (duLieu.maHocSinh && duLieu.maHocSinh !== hoSo.maHocSinh) {
      const daTonTaiMa = await this.khoHoSo.timHoSoHocSinhTheoMa(duLieu.maHocSinh);
      if (daTonTaiMa) {
        throw new ConflictException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
          thongDiep: 'Mã học sinh này đã được sử dụng',
        });
      }
    }

    return this.khoHoSo.capNhatHoSoHocSinh(id, {
      maHocSinh: duLieu.maHocSinh,
      lopHanhChinh:
        duLieu.idLopHanhChinh !== undefined
          ? duLieu.idLopHanhChinh
            ? { connect: { id: duLieu.idLopHanhChinh } }
            : { disconnect: true }
          : undefined,
      ngaySinh: duLieu.ngaySinh ? new Date(duLieu.ngaySinh) : undefined,
      diaChi: duLieu.diaChi,
    });
  }

  // ==================== NGHIỆP VỤ GIÁO VIÊN ====================

  async layDanhSachGiaoVien(thamSo: TruyVanPhanTrangDto) {
    return this.khoHoSo.timDanhSachGiaoVien(thamSo);
  }

  async layChiTietGiaoVien(id: string) {
    const hoSo = await this.khoHoSo.timHoSoGiaoVienTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ giáo viên',
      });
    }
    return hoSo;
  }

  async taoHoSoGiaoVien(duLieu: TaoHoSoGiaoVienDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(duLieu.idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Người dùng không tồn tại',
      });
    }

    const daCoHoSo = await this.khoHoSo.timHoSoGiaoVienTheoIdNguoiDung(duLieu.idNguoiDung);
    if (daCoHoSo) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Người dùng này đã có hồ sơ giáo viên',
      });
    }

    const daTonTaiMa = await this.khoHoSo.timHoSoGiaoVienTheoMa(duLieu.maGiaoVien);
    if (daTonTaiMa) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Mã giáo viên này đã được sử dụng',
      });
    }

    return this.khoHoSo.taoHoSoGiaoVien({
      nguoiDung: { connect: { id: duLieu.idNguoiDung } },
      maGiaoVien: duLieu.maGiaoVien,
      hocVi: duLieu.hocVi,
      chuyenMon: duLieu.chuyenMon,
    });
  }

  async capNhatHoSoGiaoVien(id: string, duLieu: CapNhatHoSoGiaoVienDto) {
    const hoSo = await this.khoHoSo.timHoSoGiaoVienTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ giáo viên',
      });
    }

    if (duLieu.maGiaoVien && duLieu.maGiaoVien !== hoSo.maGiaoVien) {
      const daTonTaiMa = await this.khoHoSo.timHoSoGiaoVienTheoMa(duLieu.maGiaoVien);
      if (daTonTaiMa) {
        throw new ConflictException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
          thongDiep: 'Mã giáo viên này đã được sử dụng',
        });
      }
    }

    return this.khoHoSo.capNhatHoSoGiaoVien(id, {
      maGiaoVien: duLieu.maGiaoVien,
      hocVi: duLieu.hocVi,
      chuyenMon: duLieu.chuyenMon,
    });
  }

  // ==================== LIÊN KẾT PHỤ HUYNH ====================

  async thietLapLienKetPhuHuynh(duLieu: ThietLapLienKetPhuHuynhDto) {
    const phuHuynh = await this.khoNguoiDung.timTheoId(duLieu.idPhuHuynh);
    if (!phuHuynh || phuHuynh.vaiTro !== VaiTro.PHU_HUYNH) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
        thongDiep: 'Người dùng được chỉ định không phải là tài khoản Phụ huynh',
      });
    }

    const hocSinh = await this.khoHoSo.timHoSoHocSinhTheoId(duLieu.idHocSinh);
    if (!hocSinh) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    return this.khoHoSo.thietLapLienKetPhuHuynh(
      duLieu.idPhuHuynh,
      duLieu.idHocSinh,
      duLieu.moiQuanHe,
    );
  }

  async xoaLienKetPhuHuynh(idPhuHuynh: string, idHocSinh: string) {
    return this.khoHoSo.xoaLienKetPhuHuynh(idPhuHuynh, idHocSinh);
  }

  async layDanhSachConEm(idPhuHuynh: string) {
    return this.khoHoSo.layDanhSachConEmCuaPhuHuynh(idPhuHuynh);
  }
}
