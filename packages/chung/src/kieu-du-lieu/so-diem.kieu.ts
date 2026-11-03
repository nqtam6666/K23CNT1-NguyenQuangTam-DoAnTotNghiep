import { MucDoCanhBao } from '../hang-so/trang-thai.hang-so';

export interface CotDiem {
  id: string;
  idLopHocPhan: string;
  tenCotDiem: string;
  heSo: number;
  ngayTao: Date | string;
}

export interface DiemSo {
  id: string;
  idCotDiem: string;
  idHocSinh: string;
  giaTri: number;
  ghiChu?: string | null;
  ngayTao: Date | string;
}

export interface DongBangDiemHocSinh {
  idHocSinh: string;
  maHocSinh: string;
  hoTen: string;
  email: string;
  anhDaiDien?: string | null;
  lopHanhChinh?: string | null;
  tyLeChuyenCan: number; // %
  diemTheoCot: Record<string, { idDiem?: string; giaTri: number | null; ghiChu?: string | null }>;
  diemTrungBinhHe10: number | null;
  diemTrungBinhHe4: number | null;
  diemChu: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' | 'CHUA_XEP_LOAI';
  xepLoai: string;
  datQuaMon: boolean | null;
}

export interface ThongKeKetQuaHocPhan {
  tongSoHocSinh: number;
  soHocSinhDaDuDiem: number;
  diemTrungBinhLop: number;
  tyLeQuaMon: number;
  phanBoDiemChu: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

export interface BangDiemLopHocPhan {
  idLopHocPhan: string;
  tenLopHocPhan: string;
  maLopHocPhan: string;
  soTinChi: number;
  danhSachCotDiem: CotDiem[];
  danhSachHocSinh: DongBangDiemHocSinh[];
  thongKe: ThongKeKetQuaHocPhan;
}

export interface KetQuaNhanXetHocPhanAI {
  idHocSinh: string;
  hoTen: string;
  maHocSinh: string;
  diemTrungBinhHe10: number | null;
  diemChu: string;
  xepLoai: string;
  tyLeChuyenCan: number;
  nhanXetChiTiet: string;
  diemManh: string[];
  diemCanCaiThien: string[];
  loTrinhDeXuat: string[];
}

export interface CanhBaoHocSinh {
  idHocSinh: string;
  maHocSinh: string;
  hoTen: string;
  email: string;
  mucDoCanhBao: MucDoCanhBao;
  tyLeChuyenCan: number;
  soBaiTapDaNop: number;
  tongSoBaiTap: number;
  soBaiNopMuon: number;
  diemTrungBinhHe10: number | null;
  diemKiemTraGanNhat: number | null;
  xuHuongDiem: 'TANG' | 'GIAM' | 'ON_DINH' | 'CHUA_CO_DU_LIEU';
  lyDoCanhBao: string[];
  khuyenNghiCanThiep: string;
}

export interface DeXuatOnTapChuDe {
  idCauHoi?: string;
  idBaiKiemTra: string;
  tieuDeBaiKiemTra: string;
  noiDungCauHoi: string;
  soLuotTraLoiSai: number;
  tongSoLuotLam: number;
  tyLeSai: number; // %
  dapAnDung: string;
  giaiThichOnTap: string;
  taiLieuKhuyenNghi: {
    idTaiLieu: string;
    tieuDeTaiLieu: string;
  }[];
}

export interface PhanTichHocTapLop {
  idLopHocPhan: string;
  tenLopHocPhan: string;
  maLopHocPhan: string;
  tongQuanCanhBao: {
    tongSoHocSinh: number;
    soHocSinhNghiemTrong: number;
    soHocSinhCanLuuY: number;
    soHocSinhOnDinh: number;
    tyLeHoanThanhBaiTapTrungBinh: number;
  };
  danhSachCanhBao: CanhBaoHocSinh[];
  deXuatOnTapTheoChuDe: DeXuatOnTapChuDe[];
}
