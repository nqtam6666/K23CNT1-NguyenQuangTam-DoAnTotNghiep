import { TrangThaiBuoiHoc } from '../hang-so/trang-thai.hang-so';

export interface NamHoc {
  id: string;
  tenNamHoc: string;
  hienTai: boolean;
  ngayTao: string | Date;
}

export interface HocKy {
  id: string;
  idNamHoc: string;
  tenHocKy: string;
  hienTai: boolean;
  ngayBatDau: string | Date;
  ngayKetThuc: string | Date;
  ngayTao: string | Date;
  namHoc?: NamHoc;
}

export interface MonHoc {
  id: string;
  maMonHoc: string;
  tenMonHoc: string;
  soTinChi: number;
  moTa?: string | null;
  ngayTao: string | Date;
}

export interface LopHanhChinh {
  id: string;
  maLop: string;
  tenLop: string;
  khoiLop: number;
  idGiaoVienCN?: string | null;
  ngayTao: string | Date;
  giaoVienChuNhiem?: {
    id: string;
    maGiaoVien: string;
    nguoiDung: {
      id: string;
      hoTen: string;
      email: string;
      soDienThoai?: string | null;
    };
  } | null;
  _count?: {
    danhSachHocSinh: number;
  };
}

export interface LopHocPhan {
  id: string;
  maLopHocPhan: string;
  tenLopHocPhan: string;
  idMonHoc: string;
  idHocKy: string;
  idGiaoVien: string;
  maThamGia: string;
  moTa?: string | null;
  kichHoat: boolean;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
  monHoc?: MonHoc;
  hocKy?: HocKy;
  giaoVien?: {
    id: string;
    maGiaoVien: string;
    nguoiDung: {
      id: string;
      hoTen: string;
      email: string;
      anhDaiDien?: string | null;
    };
  };
  _count?: {
    danhSachGhiDanh: number;
    cacBuoiHoc: number;
    cacBaiTap: number;
  };
}

export interface GhiDanh {
  id: string;
  idLopHocPhan: string;
  idHocSinh: string;
  ngayGhiDanh: string | Date;
  hocSinh?: {
    id: string;
    maHocSinh: string;
    nguoiDung: {
      id: string;
      hoTen: string;
      email: string;
      anhDaiDien?: string | null;
      soDienThoai?: string | null;
    };
    lopHanhChinh?: {
      id: string;
      maLop: string;
      tenLop: string;
    } | null;
  };
}

export interface ThoiKhoaBieu {
  id: string;
  idLopHocPhan: string;
  thuTrongTuan: number; // 2 -> 8 (Thứ 2 đến Chủ nhật)
  tietBatDau: number;
  soTiet: number;
  phongHoc?: string | null;
  ngayTao: string | Date;
  lopHocPhan?: LopHocPhan;
}

export interface BuoiHoc {
  id: string;
  idLopHocPhan: string;
  chuDe: string;
  thoiGianBD: string | Date;
  thoiGianKT: string | Date;
  trangThai: TrangThaiBuoiHoc;
  ngayTao: string | Date;
  lopHocPhan?: LopHocPhan;
}
