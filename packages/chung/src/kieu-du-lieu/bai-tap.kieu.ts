import { HinhThucNop, TrangThaiBaiNop } from '../hang-so/trang-thai.hang-so';

export interface BaiNop {
  id: string;
  idBaiTap: string;
  idNguoiDung: string;
  noiDung?: string | null;
  duongDanTep?: string | null;
  trangThai: TrangThaiBaiNop;
  diemSo?: number | null;
  nhanXet?: string | null;
  ngayNop: string | Date;
  ngayCham?: string | Date | null;
  nguoiNop?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    hoSoHocSinh?: {
      maHocSinh: string;
    } | null;
  };
}

export interface BaiTap {
  id: string;
  idLopHocPhan: string;
  tieuDe: string;
  noiDung: string;
  hanNop: string | Date;
  diemToiDa: number;
  hinhThucNop: HinhThucNop;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
  baiNopCuaToi?: BaiNop | null;
  _count?: {
    cacBaiNop: number;
  };
}
