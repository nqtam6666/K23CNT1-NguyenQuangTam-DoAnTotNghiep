import { LoaiTaiLieu } from '../hang-so/trang-thai.hang-so';

export interface DanhGiaTaiLieu {
  id: string;
  idTaiLieu: string;
  idNguoiDung: string;
  hoTenNguoiDung: string;
  vaiTroNguoiDung?: string;
  soSao: number;
  nhanXet?: string | null;
  ngayTao: string | Date;
}

export interface PhienBanTaiLieu {
  id: string;
  idTaiLieu: string;
  soPhienBan: number;
  tieuDe: string;
  duongDanTep: string;
  kichThuocTep: number;
  ghiChuThayDoi: string;
  hoTenNguoiCapNhat: string;
  ngayTao: string | Date;
  laPhienBanHienTai?: boolean;
}

export interface TaiLieu {
  id: string;
  idLopHocPhan: string;
  tieuDe: string;
  moTa?: string | null;
  duongDanTep: string;
  loaiTaiLieu: LoaiTaiLieu;
  kichThuocTep: number;
  ngayTao: string | Date;
  soPhienBanHienTai?: number;
  ghiChuPhienBanMoiNhat?: string | null;
  ngayCapNhatPhienBan?: string | Date | null;
  diemDanhGiaTrungBinh?: number;
  tongSoDanhGia?: number;
  danhGiaCuaToi?: {
    soSao: number;
    nhanXet?: string | null;
    ngayTao: string | Date;
  } | null;
  soDoanVectorRag?: number;
}
