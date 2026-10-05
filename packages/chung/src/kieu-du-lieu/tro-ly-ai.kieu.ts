import { LoaiBanNhapAI, TrangThaiBanNhapAI, LoaiTaiLieu } from '../hang-so/trang-thai.hang-so';

/**
 * Cấu trúc nguồn trích dẫn RAG
 */
export interface NguonTrichDan {
  idDoan?: string;
  idTaiLieu?: string;
  tieuDeTaiLieu: string;
  loaiTaiLieu?: LoaiTaiLieu;
  soTrang?: number | null;
  soThuTu?: number;
  doTuongDong: number;
  noiDung: string;
}

/**
 * Tin nhắn trong phiên hội thoại với Trợ lý AI
 */
export interface TinNhanTroLy {
  id: string;
  idPhien: string;
  vaiTro: 'user' | 'assistant' | 'system';
  noiDung: string;
  trichDan?: NguonTrichDan[] | null;
  ngayTao: Date | string;
}

/**
 * Phiên hội thoại Trợ lý AI
 */
export interface PhienTroLy {
  id: string;
  idNguoiDung: string;
  tieuDe: string;
  ngayTao: Date | string;
  cacTinNhan?: TinNhanTroLy[];
  _count?: {
    cacTinNhan: number;
  };
}

/**
 * Đoạn tài liệu được tách ra và lưu trữ vector đặc trưng
 */
export interface DoanTaiLieu {
  id: string;
  idTaiLieu: string;
  idLopHocPhan: string;
  soThuTu: number;
  noiDung: string;
  ngayTao: Date | string;
}

/**
 * Bản nháp nội dung do AI gợi ý (chỉ tạo bản nháp theo Rule 04)
 */
export interface BanNhapAI {
  id: string;
  idLopHocPhan: string;
  idGiaoVien: string;
  loaiBanNhap: LoaiBanNhapAI;
  tieuDe: string;
  duLieuJson: Record<string, any>;
  trangThai: TrangThaiBanNhapAI;
  ngayTao: Date | string;
  lopHocPhan?: {
    id: string;
    maLopHocPhan: string;
    tenLopHocPhan: string;
  };
  giaoVien?: {
    id: string;
    hoTen?: string;
  };
}

/**
 * Nhật ký kiểm toán sử dụng Trợ lý AI
 */
export interface NhatKySuDungAI {
  id: string;
  idNguoiDung: string;
  loaiTacVu: string;
  soLuongToken: number;
  doTreMs: number;
  ngayTao: Date | string;
}

/**
 * Kết quả phản hồi hỏi đáp RAG
 */
export interface KetQuaHoiDapAI {
  idPhien: string;
  tinNhanNguoiDung: TinNhanTroLy;
  tinNhanTroLy: TinNhanTroLy;
  danhSachTrichDan: NguonTrichDan[];
}
