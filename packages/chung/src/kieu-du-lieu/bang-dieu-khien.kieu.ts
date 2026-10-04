/**
 * Kiểu dữ liệu nghiệp vụ cho Bảng điều khiển (Dashboard) và Khung giao diện
 * Tuân thủ chuẩn thuật ngữ docs/thuat-ngu.md
 */

export type LoaiTienIch =
  | 'THE_THONG_KE'
  | 'BIEU_DO'
  | 'HOAT_DONG_GAN_DAY'
  | 'VIEC_CAN_XU_LY'
  | 'LOI_TAT';

export type TrangThaiTienIch = 'THANH_CONG' | 'LOI';

export interface TheThongKe {
  id: string;
  tieuDe: string;
  giaTri: number | string;
  donVi?: string;
  moTa?: string;
  xuHuong?: {
    huong: 'TANG' | 'GIAM' | 'TRUNG_TINH';
    giaTriPhanTram?: number;
    moTa?: string;
  };
  bieuTuong: string;
  mauSac?: 'xanh_duong' | 'xanh_la' | 'tim' | 'cam' | 'do';
  duongDanChiTiet?: string;
}

export interface HoatDongGanDay {
  id: string;
  hanhDong: string;
  thucThe: string;
  idThucThe?: string;
  tenNguoiThucHien: string;
  thoiGian: string;
  chiTiet?: Record<string, any>;
}

export interface ViecCanXuLy {
  id: string;
  tieuDe: string;
  moTa: string;
  loai: 'CHAM_DIEM' | 'DUYET_DON' | 'NOP_BAI' | 'DUYET_AI' | 'XEP_LICH' | 'KHAC';
  mucDoUuTien: 'CAO' | 'TRUNG_BINH' | 'THAP';
  thoiHan?: string;
  duongDan: string;
}

export interface DuLieuBieuDo {
  ten: string;
  giaTri: number;
  nhan?: string;
  [khoa: string]: any;
}

export interface TienIchBangDieuKhien {
  id: string;
  loai: LoaiTienIch;
  tieuDe: string;
  moTa?: string;
  duongDanChiTiet?: string;
  duLieu: any;
  trangThai: TrangThaiTienIch;
  thongDiepLoi?: string;
}

export interface PhanHoiBangDieuKhien {
  tienIch: TienIchBangDieuKhien[];
  thoiGianTao: string;
}

export interface SucKhoeHeThong {
  trangThai: 'HOAT_DONG_TOT' | 'CANH_BAO' | 'GAP_SU_CO';
  dichVu: {
    coSoDuLieu: 'SAN_SANG' | 'LOI_KET_NOI';
    boNhoDemRedis: 'SAN_SANG' | 'LOI_KET_NOI';
    luuTruMinIO: 'SAN_SANG' | 'LOI_KET_NOI';
    phongHocLiveKit: 'SAN_SANG' | 'LOI_KET_NOI';
  };
  thoiGian: string;
}
