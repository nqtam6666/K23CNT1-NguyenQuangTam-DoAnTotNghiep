import { VaiTro } from '../hang-so/vai-tro.hang-so';

/**
 * Payload chứa trong JWT Access Token
 */
export interface PayloadJwt {
  sub: string; // idNguoiDung
  id: string; // idNguoiDung
  email: string;
  vaiTro: VaiTro;
  hoTen: string;
  iat?: number;
  exp?: number;
}

/**
 * Dữ liệu trả về khi đăng nhập hoặc làm mới token thành công
 */
export interface KetQuaXacThuc {
  accessToken: string;
  refreshToken: string;
  nguoiDung: ThongTinNguoiDungTomTat;
}

/**
 * Thông tin người dùng tóm tắt trả về kèm token
 */
export interface ThongTinNguoiDungTomTat {
  id: string;
  email: string;
  hoTen: string;
  vaiTro: VaiTro;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
}
