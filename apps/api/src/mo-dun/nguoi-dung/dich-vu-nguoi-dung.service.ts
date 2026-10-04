import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  TaoNguoiDungDto,
  CapNhatNguoiDungDto,
  ChuyenTrangThaiNguoiDungDto,
  DatLaiMatKhauAdminDto,
  TruyVanNguoiDungDto,
  MaLoiNghiepVu,
} from '@lms/chung';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';

@Injectable()
export class DichVuNguoiDung {
  constructor(private readonly khoNguoiDung: KhoNguoiDung) {}

  /**
   * Lấy danh sách người dùng có phân trang và bộ lọc
   */
  async layDanhSach(thamSo: TruyVanNguoiDungDto) {
    return this.khoNguoiDung.timDanhSachPhanTrang(thamSo);
  }

  /**
   * Xem chi tiết thông tin một người dùng kèm hồ sơ chuyên môn
   */
  async layChiTiet(id: string) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(id, true);
    if (!nguoiDung || nguoiDung.ngayXoa) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng trong hệ thống',
      });
    }

    // Không trả về mật khẩu
    const { matKhau, ...duLieuAnToan } = nguoiDung;
    return duLieuAnToan;
  }

  /**
   * Quản trị viên tạo người dùng mới
   */
  async taoMoi(duLieu: TaoNguoiDungDto) {
    const daTonTai = await this.khoNguoiDung.timTheoEmail(duLieu.email);
    if (daTonTai) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.EMAIL_DA_TON_TAI,
        thongDiep: 'Email này đã được sử dụng',
      });
    }

    const matKhauBăm = await argon2.hash(duLieu.matKhau, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    const nguoiDung = await this.khoNguoiDung.taoNguoiDung({
      email: duLieu.email,
      matKhau: matKhauBăm,
      hoTen: duLieu.hoTen,
      soDienThoai: duLieu.soDienThoai,
      vaiTro: duLieu.vaiTro,
      kichHoat: duLieu.kichHoat ?? true,
    });

    const { matKhau, ...ketQua } = nguoiDung;
    return ketQua;
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async capNhat(id: string, duLieu: CapNhatNguoiDungDto) {
    await this.layChiTiet(id);

    const capNhat = await this.khoNguoiDung.capNhatNguoiDung(id, {
      hoTen: duLieu.hoTen,
      soDienThoai: duLieu.soDienThoai,
      vaiTro: duLieu.vaiTro,
      kichHoat: duLieu.kichHoat,
    });

    const { matKhau, ...ketQua } = capNhat;
    return ketQua;
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng
   */
  async chuyenTrangThai(id: string, duLieu: ChuyenTrangThaiNguoiDungDto, idNguoiThucHien: string) {
    if (id === idNguoiThucHien && !duLieu.kichHoat) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
        thongDiep: 'Bạn không thể tự khóa tài khoản của chính mình',
      });
    }

    await this.layChiTiet(id);

    const nguoiDung = await this.khoNguoiDung.chuyenTrangThai(id, duLieu.kichHoat);

    // Nếu khóa tài khoản thì thu hồi toàn bộ phiên đăng nhập lập tức
    if (!duLieu.kichHoat) {
      await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(id);
    }

    const { matKhau, ...ketQua } = nguoiDung;
    return ketQua;
  }

  /**
   * Quản trị viên đặt lại mật khẩu cho tài khoản người dùng
   */
  async datLaiMatKhau(id: string, duLieu: DatLaiMatKhauAdminDto) {
    await this.layChiTiet(id);

    const matKhauBăm = await argon2.hash(duLieu.matKhauMoi, {
      type: argon2.argon2id,
    });

    await this.khoNguoiDung.capNhatNguoiDung(id, {
      matKhau: matKhauBăm,
    });

    // Thu hồi phiên cũ để bắt buộc đăng nhập lại bằng mật khẩu mới
    await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(id);

    return { thongDiep: 'Đặt lại mật khẩu thành công' };
  }

  /**
   * Xóa mềm người dùng
   */
  async xoa(id: string, idNguoiThucHien: string) {
    if (id === idNguoiThucHien) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
        thongDiep: 'Bạn không thể tự xóa tài khoản của chính mình',
      });
    }

    await this.layChiTiet(id);
    await this.khoNguoiDung.xoaMem(id);
    await this.khoNguoiDung.thuHoiTatCaPhienCuaNguoiDung(id);

    return { thongDiep: 'Đã xóa người dùng thành công' };
  }
}
