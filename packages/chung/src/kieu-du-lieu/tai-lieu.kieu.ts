import { LoaiTaiLieu } from '../hang-so/trang-thai.hang-so';

export interface TaiLieu {
  id: string;
  idLopHocPhan: string;
  tieuDe: string;
  moTa?: string | null;
  duongDanTep: string;
  loaiTaiLieu: LoaiTaiLieu;
  kichThuocTep: number;
  ngayTao: string | Date;
}
