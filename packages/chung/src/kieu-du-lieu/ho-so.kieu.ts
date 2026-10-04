import { VaiTro } from '../hang-so/vai-tro.hang-so';

/**
 * Thông tin chi tiết hồ sơ học sinh
 */
export interface ThongTinHoSoHocSinh {
  id: string;
  idNguoiDung: string;
  maHocSinh: string;
  idLopHanhChinh?: string | null;
  ngaySinh?: Date | string | null;
  diaChi?: string | null;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
  nguoiDung?: {
    id: string;
    email: string;
    hoTen: string;
    soDienThoai?: string | null;
    anhDaiDien?: string | null;
    kichHoat: boolean;
  };
  lopHanhChinh?: {
    id: string;
    maLop: string;
    tenLop: string;
    khoiLop: number;
  } | null;
}

/**
 * Thông tin chi tiết hồ sơ giáo viên
 */
export interface ThongTinHoSoGiaoVien {
  id: string;
  idNguoiDung: string;
  maGiaoVien: string;
  hocVi?: string | null;
  chuyenMon?: string | null;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
  nguoiDung?: {
    id: string;
    email: string;
    hoTen: string;
    soDienThoai?: string | null;
    anhDaiDien?: string | null;
    kichHoat: boolean;
  };
}

/**
 * Thông tin liên kết phụ huynh - học sinh
 */
export interface ThongTinLienKetPhuHuynh {
  id: string;
  idPhuHuynh: string;
  idHocSinh: string;
  moiQuanHe: string;
  ngayTao: Date | string;
  phuHuynh?: {
    id: string;
    email: string;
    hoTen: string;
    soDienThoai?: string | null;
  };
  hocSinh?: ThongTinHoSoHocSinh;
}
