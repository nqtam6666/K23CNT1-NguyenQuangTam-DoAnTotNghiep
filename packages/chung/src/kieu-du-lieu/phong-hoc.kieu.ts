import { VaiTro } from '../hang-so/vai-tro.hang-so';
import { TrangThaiBuoiHoc, TrangThaiDiemDanh } from '../hang-so/trang-thai.hang-so';

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
  ghiChu?: string | null;
  ngayDiemDanh: Date | string;
  hocSinh?: {
    id: string;
    maHocSinh: string;
    nguoiDung: {
      hoTen: string;
      email: string;
    };
  };
}
