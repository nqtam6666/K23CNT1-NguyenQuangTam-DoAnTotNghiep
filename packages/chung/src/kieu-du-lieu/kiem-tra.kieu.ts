import {
  CheDoKiemTra,
  LoaiCauHoi,
  TrangThaiBaiKiemTra,
  TrangThaiLuotLam,
} from '../hang-so/trang-thai.hang-so';

export interface PhuongAnCauHoi {
  ma: string;
  noiDung: string;
}

export interface CauHoi {
  id: string;
  idBaiKiemTra: string;
  thuTu: number;
  noiDung: string;
  loaiCauHoi: LoaiCauHoi;
  cacPhuongAn: PhuongAnCauHoi[];
  dapAnDung?: string; // Chỉ hiển thị cho giáo viên hoặc sau khi nộp bài
  giaiThich?: string | null;
  diemCau: number;
  ngayTao: Date | string;
}

export interface ChiTietCauTraLoi {
  idCauHoi: string;
  thuTu: number;
  noiDungCauHoi: string;
  dapAnChon: string;
  dapAnDung: string;
  dungHaySai: boolean;
  diemDatDuoc: number;
  giaiThich?: string | null;
}

export interface LuotLamBai {
  id: string;
  idBaiKiemTra: string;
  idHocSinh: string;
  lanThu: number;
  trangThai: TrangThaiLuotLam;
  chiTietTraLoi: ChiTietCauTraLoi[];
  soCauDung: number;
  tongSoCau: number;
  diemSo: number;
  nhanXetAI?: string | null;
  thoiGianBatDau: Date | string;
  thoiGianNop: Date | string;
  thoiLuongGiay: number;
  hocSinh?: {
    id: string;
    maHocSinh: string;
    nguoiDung: {
      id: string;
      hoTen: string;
      email: string;
      anhDaiDien?: string | null;
    };
  };
}

export interface BaiKiemTra {
  id: string;
  idLopHocPhan: string;
  tieuDe: string;
  moTa?: string | null;
  cheDo: CheDoKiemTra;
  trangThai: TrangThaiBaiKiemTra;
  thoiGianLamPhut: number;
  soLuotToiDa: number;
  diemToiDa: number;
  tronCauHoi: boolean;
  hienDapAnNgay: boolean;
  hanKetThuc?: Date | string | null;
  ngayTao: Date | string;
  ngayCapNhat: Date | string;
  cacCauHoi?: CauHoi[];
  cacLuotLam?: LuotLamBai[];
  _count?: {
    cacCauHoi: number;
    cacLuotLam: number;
  };
  // Dành cho học sinh đang đăng nhập
  soLuotDaLam?: number;
  diemCaoNhatCuaToi?: number | null;
  luotLamGanNhat?: LuotLamBai | null;
}
