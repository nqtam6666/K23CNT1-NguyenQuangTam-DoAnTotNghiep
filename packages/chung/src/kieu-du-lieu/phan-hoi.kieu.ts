/**
 * Chuẩn định dạng phản hồi API thành công
 */
export interface PhanHoiChuan<T = unknown> {
  thanhCong: true;
  thongDiep?: string;
  duLieu: T;
  thoiGian: string;
}

/**
 * Chuẩn định dạng phản hồi phân trang
 */
export interface PhanHoiPhanTrang<T = unknown> {
  thanhCong: true;
  duLieu: T[];
  tongSo: number;
  trangHienTai: number;
  kichThuocTrang: number;
  tongSoTrang: number;
  thoiGian: string;
}

/**
 * Chuẩn định dạng phản hồi API lỗi
 */
export interface PhanHoiLoi {
  thanhCong: false;
  maLoi: string;
  thongDiep: string;
  chiTiet?: unknown;
  duongDan?: string;
  thoiGian: string;
}
