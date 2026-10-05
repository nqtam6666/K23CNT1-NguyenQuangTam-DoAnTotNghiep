export interface BinhLuan {
  id: string;
  idBaiDang: string;
  idNguoiDung: string;
  noiDung: string;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
  nguoiDung?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
  };
}

export interface BaiDang {
  id: string;
  idLopHocPhan: string;
  idNguoiDung: string;
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
