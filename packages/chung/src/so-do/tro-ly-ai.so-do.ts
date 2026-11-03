import { z } from 'zod';
import {
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  MucDoGiaiThich,
  MucDoKho,
} from '../hang-so/trang-thai.hang-so';

/**
 * Schema gửi tin nhắn hỏi đáp Trợ lý AI (RAG)
 */
export const guiTinNhanTroLySchema = z.object({
  idPhien: z.string().uuid('ID phiên không hợp lệ').optional(),
  idLopHocPhan: z.string().uuid('ID lớp học phần không hợp lệ').optional(),
  noiDung: z
    .string({ required_error: 'Nội dung câu hỏi là bắt buộc' })
    .trim()
    .min(1, 'Nội dung câu hỏi không được để trống')
    .max(3000, 'Nội dung câu hỏi tối đa 3.000 ký tự'),
  mucDoGiaiThich: z.nativeEnum(MucDoGiaiThich).optional(),
});

export type GuiTinNhanTroLyInput = z.infer<typeof guiTinNhanTroLySchema>;

/**
 * Schema tạo bản nháp gợi ý từ AI (Rule 04: AI chỉ tạo bản nháp)
 */
export const taoBanNhapAISchema = z.object({
  idLopHocPhan: z.string().uuid('Vui lòng chọn lớp học phần hợp lệ'),
  loaiBanNhap: z.nativeEnum(LoaiBanNhapAI, {
    required_error: 'Loại bản nháp AI là bắt buộc',
  }),
  tieuDe: z
    .string({ required_error: 'Tiêu đề bản nháp là bắt buộc' })
    .trim()
    .min(1, 'Vui lòng nhập tiêu đề bản nháp')
    .max(200, 'Tiêu đề bản nháp tối đa 200 ký tự'),
  duLieuJson: z.record(z.any(), {
    required_error: 'Dữ liệu bản nháp JSON là bắt buộc',
  }),
});

export type TaoBanNhapAIInput = z.infer<typeof taoBanNhapAISchema>;

/**
 * Schema sinh bản nháp tự động từ tài liệu theo chương và độ khó (Nhóm 3)
 */
export const sinhBanNhapTuTaiLieuSchema = z.object({
  idLopHocPhan: z.string().uuid('Vui lòng chọn lớp học phần hợp lệ'),
  idTaiLieu: z.string().uuid('Mã tài liệu không hợp lệ').optional().nullable(),
  loaiBanNhap: z.nativeEnum(LoaiBanNhapAI),
  chuDe: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập chương hoặc chủ đề trọng tâm')
    .max(300, 'Chủ đề tối đa 300 ký tự'),
  mucDoKho: z.nativeEnum(MucDoKho).optional(),
  soLuongCau: z.number().int().min(3).max(20).optional(),
});

export type SinhBanNhapTuTaiLieuInput = z.infer<typeof sinhBanNhapTuTaiLieuSchema>;

/**
 * Schema gợi ý nhận xét bài nộp bằng AI (Nhóm 3)
 */
export const goiYNhanXetBaiNopSchema = z.object({
  idBaiNop: z.string().uuid('Mã bài nộp không hợp lệ'),
});

export type GoiYNhanXetBaiNopInput = z.infer<typeof goiYNhanXetBaiNopSchema>;

/**
 * Schema phê duyệt bản nháp AI (Giáo viên / Ban giám hiệu)
 */
export const duyetBanNhapAISchema = z.object({
  trangThai: z.enum([TrangThaiBanNhapAI.DA_DUYET, TrangThaiBanNhapAI.TU_CHOI], {
    required_error: 'Trạng thái phê duyệt là bắt buộc (DA_DUYET hoặc TU_CHOI)',
  }),
});

export type DuyetBanNhapAIInput = z.infer<typeof duyetBanNhapAISchema>;

/**
 * Schema nạp tài liệu vào kho vector
 */
export const napTaiLieuVectorSchema = z.object({
  idTaiLieu: z.string().uuid('ID tài liệu không hợp lệ'),
});

export type NapTaiLieuVectorInput = z.infer<typeof napTaiLieuVectorSchema>;

/**
 * Schema kiểm tra kết nối tới dịch vụ LLM
 */
export const kiemTraKetNoiAISchema = z.object({
  nhaCungCap: z.enum(['gemini', 'openai', 'groq', 'ollama', 'tuy_chon']).optional(),
  apiKey: z.string().trim().optional(),
  model: z.string().trim().optional(),
  baseUrl: z.string().trim().optional(),
});

export type KiemTraKetNoiAIInput = z.infer<typeof kiemTraKetNoiAISchema>;
