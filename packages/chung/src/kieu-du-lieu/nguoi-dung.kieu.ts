import { VaiTro } from '../hang-so/vai-tro.hang-so';

/**
 * Thông tin chi tiết của người dùng
 */
export interface ThongTinNguoiDungChiTiet {
  id: string;
  email: string;
  hoTen: string;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  vaiTro: VaiTro;
  kichHoat: boolean;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
}
