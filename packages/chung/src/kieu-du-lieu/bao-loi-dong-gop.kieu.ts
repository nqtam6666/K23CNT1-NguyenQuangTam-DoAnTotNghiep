import { LoaiBaoLoiDongGop, MucDoUuTienBaoLoi, TrangThaiBaoLoi } from '../hang-so/trang-thai.hang-so';
import { VaiTro } from '../hang-so/vai-tro.hang-so';

export interface BaoLoiDongGop {
  id: string;
  idNguoiDung: string;
  loaiPhanHoi: LoaiBaoLoiDongGop;
  mucDoUuTien: MucDoUuTienBaoLoi;
  tieuDe: string;
  noiDung: string;
  anhDinhKem?: string | null;
  thongTinTrinhDuyet?: string | null;
  trangThai: TrangThaiBaoLoi;
  phanHoiXuLy?: string | null;
  idNguoiXuLy?: string | null;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;

  nguoiDung?: {
    id: string;
    hoTen: string;
    email: string;
    anhDaiDien?: string | null;
    vaiTro: VaiTro;
  };

  nguoiXuLy?: {
    id: string;
    hoTen: string;
    email: string;
  } | null;
}

export interface ThongKeBaoLoi {
  tongSo: number;
  choTiepNhan: number;
  dangXuLy: number;
  daXuLy: number;
  tuChoi: number;
}
