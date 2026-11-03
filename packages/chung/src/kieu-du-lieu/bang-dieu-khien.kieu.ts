/**
 * Kiểu dữ liệu nghiệp vụ cho Bảng điều khiển (Dashboard) và Khung giao diện
 * Tuân thủ chuẩn thuật ngữ docs/thuat-ngu.md
 */

export type LoaiTienIch =
  | 'THE_THONG_KE'
  | 'BIEU_DO'
  | 'HOAT_DONG_GAN_DAY'
  | 'VIEC_CAN_XU_LY'
  | 'LOI_TAT'
  | 'LICH_HOM_NAY'
  | 'TOM_TAT_LOP'
  | 'CANH_BAO_SOM'
  | 'HANG_CHO_XU_LY';

export type TrangThaiTienIch = 'THANH_CONG' | 'LOI';

/** Một buổi học (sinh viên) hoặc buổi dạy (giảng viên) trong ngày hôm nay */
export interface BuoiHocHomNay {
  id: string;
  idLopHocPhan: string;
  maLopHocPhan: string;
  tenLopHocPhan: string;
  chuDe: string;
  thoiGianBD: string;
  thoiGianKT: string;
  trangThai: 'CHUA_BAT_DAU' | 'DANG_DIEN_RA' | 'DA_KET_THUC' | 'DA_HUY';
  tenGiangVien?: string;
  /** Sinh viên: trạng thái điểm danh của chính mình, null nếu chưa điểm danh */
  trangThaiDiemDanh?: 'CO_MAT' | 'VANG_CO_PHEP' | 'VANG_KHONG_PHEP' | 'DI_MUON' | null;
  /** Giảng viên: số sinh viên có mặt và sĩ số lớp */
  soCoMat?: number;
  siSo?: number;
  /** Giảng viên: mã điểm danh còn hiệu lực */
  maDiemDanh?: string | null;
  hanMaDiemDanh?: string | null;
}

/** Tóm tắt một lớp học phần trên bảng điều khiển */
export interface TomTatLopHocPhan {
  id: string;
  maLopHocPhan: string;
  tenLopHocPhan: string;
  tenGiangVien?: string;
  siSo: number;
  /** Sinh viên: số buổi có mặt và số buổi đã điểm danh của chính mình */
  soBuoiCoMat?: number;
  soBuoiDaDiemDanh?: number;
  /** Giảng viên: tỷ lệ có mặt và tỷ lệ nộp bài của cả lớp (0-100), null nếu chưa có dữ liệu */
  tyLeChuyenCan?: number | null;
  tyLeNopBai?: number | null;
}

/** Sinh viên cần giảng viên chú ý (cảnh báo sớm) */
export interface CanhBaoSinhVien {
  idHocSinh: string;
  hoTen: string;
  idLopHocPhan: string;
  maLopHocPhan: string;
  lyDo: string;
  mucDo: 'CAO' | 'VUA' | 'THAP';
}

/** Hàng chờ xử lý của giảng viên */
export interface HangChoXuLyGiangVien {
  chamBai: {
    idBaiTap: string;
    idLopHocPhan: string;
    maLopHocPhan: string;
    tieuDe: string;
    soChoCham: number;
    hanNop: string;
  }[];
  donXinNghi: {
    id: string;
    idLopHocPhan: string;
    maLopHocPhan: string;
    hoTen: string;
    lyDo: string;
    ngayBuoiHoc: string;
  }[];
  banNhap: {
    id: string;
    idLopHocPhan: string;
    maLopHocPhan: string;
    tieuDe: string;
    loaiBanNhap: string;
  }[];
}

export interface TheThongKe {
  id: string;
  tieuDe: string;
  giaTri: number | string;
  donVi?: string;
  moTa?: string;
  xuHuong?: {
    huong: 'TANG' | 'GIAM' | 'TRUNG_TINH';
    giaTriPhanTram?: number;
    moTa?: string;
  };
  bieuTuong: string;
  mauSac?: 'xanh_duong' | 'xanh_la' | 'tim' | 'cam' | 'do';
  duongDanChiTiet?: string;
}

export interface HoatDongGanDay {
  id: string;
  hanhDong: string;
  thucThe: string;
  idThucThe?: string;
  tenNguoiThucHien: string;
  thoiGian: string;
  chiTiet?: Record<string, any>;
}

export interface ViecCanXuLy {
  id: string;
  tieuDe: string;
  moTa: string;
  loai: 'CHAM_DIEM' | 'DUYET_DON' | 'NOP_BAI' | 'DUYET_AI' | 'XEP_LICH' | 'KHAC';
  mucDoUuTien: 'CAO' | 'TRUNG_BINH' | 'THAP';
  thoiHan?: string;
  duongDan: string;
}

export interface DuLieuBieuDo {
  ten: string;
  giaTri: number;
  nhan?: string;
  [khoa: string]: any;
}

export interface TienIchBangDieuKhien {
  id: string;
  loai: LoaiTienIch;
  tieuDe: string;
  moTa?: string;
  duongDanChiTiet?: string;
  duLieu: any;
  trangThai: TrangThaiTienIch;
  thongDiepLoi?: string;
}

export interface PhanHoiBangDieuKhien {
  tienIch: TienIchBangDieuKhien[];
  thoiGianTao: string;
}

export interface SucKhoeHeThong {
  trangThai: 'HOAT_DONG_TOT' | 'CANH_BAO' | 'GAP_SU_CO';
  dichVu: {
    coSoDuLieu: 'SAN_SANG' | 'LOI_KET_NOI';
    boNhoDemRedis: 'SAN_SANG' | 'LOI_KET_NOI';
    luuTruMinIO: 'SAN_SANG' | 'LOI_KET_NOI';
    phongHocLiveKit: 'SAN_SANG' | 'LOI_KET_NOI';
  };
  thoiGian: string;
}

export type PhanLoaiThongBao =
  | 'CAN_XU_LY'
  | 'LOP_HOC'
  | 'BAI_TAP'
  | 'DIEM_SO'
  | 'DIEM_DANH'
  | 'HE_THONG';

export interface MucThongBaoThucTe {
  id: string;
  loai: 'info' | 'success' | 'warning' | 'danger';
  phanLoai: PhanLoaiThongBao;
  eyebrow: string;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  daDoc: boolean;
  duongDan?: string;
  nhanHanhDong?: string;
}

export interface ThongTinHocKyThucTe {
  tenHocKy: string;
  tenNamHoc: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  soLopThamGia: number;
  soBuoiHocHomNay: number;
  soViecCanXuLy: number;
}

export interface PhanHoiThongBaoBangDieuKhien {
  hocKyHienTai: ThongTinHocKyThucTe | null;
  banTinToanTruong: {
    tieuDe: string;
    noiDung: string;
    loai: 'info' | 'success' | 'warning' | 'danger';
    thoiGianCapNhat: string | null;
  } | null;
  danhSachThongBao: MucThongBaoThucTe[];
  tongSoChuaDoc: number;
  thoiGianDongBo: string;
}

export interface KetQuaGuiThuThongBaoDaKenh {
  thanhCong: boolean;
  thongDiep: string;
  chiTietKenh: {
    nenTang: {
      daGhiNhan: boolean;
      thongDiep: string;
    };
    windows: {
      kichHoat: boolean;
      thongDiep: string;
    };
    gmail: {
      daGui: boolean;
      emailDich: string;
      thongDiep: string;
    };
  };
  thongBaoMoi: MucThongBaoThucTe;
}


