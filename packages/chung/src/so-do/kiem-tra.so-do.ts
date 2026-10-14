import { z } from 'zod';
import {
  CheDoKiemTra,
  LoaiCauHoi,
  TrangThaiBaiKiemTra,
} from '../hang-so/trang-thai.hang-so';

export const phuongAnCauHoiSchema = z.object({
  ma: z.string().trim().min(1, 'Mã phương án không được trống (A, B, C, D)'),
  noiDung: z.string().trim().min(1, 'Nội dung phương án không được trống'),
});

export const taoCauHoiSchema = z.object({
  thuTu: z.number().int().min(1).default(1),
  noiDung: z.string().trim().min(3, 'Nội dung câu hỏi tối thiểu 3 ký tự'),
  loaiCauHoi: z.nativeEnum(LoaiCauHoi).default(LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN),
  cacPhuongAn: z.array(phuongAnCauHoiSchema).min(2, 'Phải có ít nhất 2 phương án lựa chọn'),
  dapAnDung: z.string().trim().min(1, 'Vui lòng chọn đáp án đúng'),
  giaiThich: z.string().max(2000).optional(),
  diemCau: z.number().min(0.1).max(10).default(1.0),
});

export const taoBaiKiemTraSchema = z.object({
  tieuDe: z.string().trim().min(3, 'Tiêu đề bài kiểm tra tối thiểu 3 ký tự').max(200),
  moTa: z.string().max(2000).optional(),
  cheDo: z.nativeEnum(CheDoKiemTra).default(CheDoKiemTra.LUYEN_TAP),
  trangThai: z.nativeEnum(TrangThaiBaiKiemTra).default(TrangThaiBaiKiemTra.DANG_MO),
  thoiGianLamPhut: z.number().int().min(5, 'Thời gian tối thiểu 5 phút').max(180).default(30),
  soLuotToiDa: z.number().int().min(1).max(100).default(5),
  diemToiDa: z.number().min(1).max(100).default(10.0),
  tronCauHoi: z.boolean().default(true),
  hienDapAnNgay: z.boolean().default(true),
  hanKetThuc: z.string().datetime().optional().nullable(),
  danhSachCauHoi: z.array(taoCauHoiSchema).min(1, 'Đề kiểm tra phải có ít nhất 1 câu hỏi'),
});

export type TaoBaiKiemTraInput = z.infer<typeof taoBaiKiemTraSchema>;
export type TaoCauHoiInput = z.infer<typeof taoCauHoiSchema>;

export const sinhDeKiemTraAISchema = z.object({
  tieuDe: z.string().trim().min(3, 'Tiêu đề đề kiểm tra tối thiểu 3 ký tự').max(200),
  chuDe: z.string().trim().min(3, 'Vui lòng nhập chủ đề hoặc nội dung trọng tâm').max(500),
  cheDo: z.nativeEnum(CheDoKiemTra).default(CheDoKiemTra.LUYEN_TAP),
  soLuongCau: z.number().int().min(3, 'Tối thiểu 3 câu hỏi').max(20, 'Tối đa 20 câu hỏi').default(5),
  thoiGianLamPhut: z.number().int().min(5).max(180).default(20),
  soLuotToiDa: z.number().int().min(1).max(100).default(5),
  idTaiLieu: z.string().uuid().optional().nullable(),
});

export type SinhDeKiemTraAIInput = z.infer<typeof sinhDeKiemTraAISchema>;

export const nopBaiKiemTraSchema = z.object({
  thoiLuongGiay: z.number().int().min(0).default(0),
  danhSachTraLoi: z.array(
    z.object({
      idCauHoi: z.string().uuid('ID câu hỏi không hợp lệ'),
      dapAnChon: z.string().trim(),
    }),
  ),
});

export type NopBaiKiemTraInput = z.infer<typeof nopBaiKiemTraSchema>;

export const capNhatTrangThaiBaiKiemTraSchema = z.object({
  trangThai: z.nativeEnum(TrangThaiBaiKiemTra),
});

export type CapNhatTrangThaiBaiKiemTraInput = z.infer<typeof capNhatTrangThaiBaiKiemTraSchema>;
