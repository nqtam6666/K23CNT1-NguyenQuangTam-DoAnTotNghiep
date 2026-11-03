import { ChuDeBaiDang } from '../hang-so/trang-thai.hang-so';

export interface BinhLuan {
  id: string;
  idBaiDang: string;
  idNguoiDung: string;
  noiDung: string;
  laCauTraLoiChapNhan?: boolean;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
  nguoiDung?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    vaiTro?: string;
  };
}

export interface BaiDang {
  id: string;
  idLopHocPhan: string;
  idNguoiDung: string;
  tieuDe?: string | null;
  chuDe?: ChuDeBaiDang;
  nhanChuong?: string | null;
  daGiaiDap?: boolean;
  idBinhLuanGiaiDap?: string | null;
  noiDung: string;
  ghimDauTrang: boolean;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
  nguoiDang?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    vaiTro?: string;
  };
  cacBinhLuan?: BinhLuan[];
  _count?: {
    cacBinhLuan: number;
  };
}
