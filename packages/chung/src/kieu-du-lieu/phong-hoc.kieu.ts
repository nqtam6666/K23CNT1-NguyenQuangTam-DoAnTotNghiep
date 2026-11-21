import { VaiTro } from '../hang-so/vai-tro.hang-so';
import {
  TrangThaiBuoiHoc,
  TrangThaiDiemDanh,
  TrangThaiDonXinNghi,
  PhuongThucDiemDanh,
} from '../hang-so/trang-thai.hang-so';

export interface PhongTrucTuyen {
  id: string;
  idLopHocPhan: string;
  tenPhong: string;
  dangMo: boolean;
  matKhauPhong?: string | null;
  ngayTao: Date | string;
}

export interface KetQuaTokenLiveKit {
  token: string;
  urlMayChuLiveKit: string;
  tenPhong: string;
  tenNguoiDung: string;
  vaiTroTrongPhong: 'CHU_TRI' | 'THAM_GIA';
  thoiHanGiay: number;
}

export interface NhatKyThamGia {
  id: string;
  idBuoiHoc: string;
  idNguoiDung: string;
  thoiGianVao: Date | string;
  thoiGianRa?: Date | string | null;
  thoiLuongGiay?: number | null;
  nguoiDung?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    vaiTro: VaiTro;
  };
}

export interface BanGhiDiemDanh {
  id: string;
  idBuoiHoc: string;
  idHocSinh: string;
  trangThai: TrangThaiDiemDanh;
  phuongThuc?: PhuongThucDiemDanh;
  doTinCay?: number | null;
  ghiChu?: string | null;
  ngayDiemDanh: Date | string;
  hocSinh?: {
    id: string;
    maHocSinh: string;
    nguoiDung: {
      hoTen: string;
      email: string;
      anhDaiDien?: string | null;
    };
  };
}

export interface HoSoKhuonMat {
  daDangKy: boolean;
  kichHoat: boolean;
  soMauChup?: number;
  diemChatLuong?: number | null;
  ngayDangKy?: Date | string | null;
  ngayCapNhat?: Date | string | null;
}

export interface MucDuLieuKhuonMatLop {
  idHocSinh: string;
  idNguoiDung: string;
  maHocSinh: string;
  hoTen: string;
  anhDaiDien?: string | null;
  vectorKhuonMat: number[];
}

export interface KetQuaDiemDanhKhuonMat {
  banGhi: BanGhiDiemDanh;
  doTuongDong: number;
  khoangCach: number;
  trangThai: TrangThaiDiemDanh;
  thongDiep: string;
}

export interface DonXinNghi {
  id: string;
  idBuoiHoc: string;
  idNguoiDung: string;
  lyDo: string;
  minhChung?: string | null;
  trangThai: TrangThaiDonXinNghi;
  phanHoi?: string | null;
  ngayTao: Date | string;
  buoiHoc?: {
    id: string;
    chuDe: string;
    thoiGianBD: Date | string;
    thoiGianKT: Date | string;
  };
  nguoiGui?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    hoSoHocSinh?: {
      id: string;
      maHocSinh: string;
    } | null;
  };
}

export interface ChiTietChuyenCanHocSinh {
  idHocSinh: string;
  maHocSinh: string;
  hoTen: string;
  email: string;
  anhDaiDien?: string | null;
  lopHanhChinh?: string | null;
  soBuoiCoMat: number;
  soBuoiDiMuon: number;
  soBuoiVangCoPhep: number;
  soBuoiVangKhongPhep: number;
  tongSoBuoiDaDiemDanh: number;
  tyLeChuyenCan: number; // %
  diemChuyenCanDuKien: number; // thang 10
  mucCanhBao: 'AN_TOAN' | 'LUU_Y' | 'NGUY_CO_CAM_THI';
  nhanXetChuyenCan: string;
}

export interface ThongKeChuyenCanLop {
  idLopHocPhan: string;
  tongSoBuoiHoc: number;
  soBuoiDaToChuc: number;
  tyLeChuyenCanTrungBinh: number;
  soHocSinhNguyCoCamThi: number;
  soDonXinNghiChoDuyet: number;
  danhSachHocSinh: ChiTietChuyenCanHocSinh[];
}

