import { z } from 'zod';
import { ChuDeBaiDang } from '../hang-so/trang-thai.hang-so';

export const taoBaiDangSchema = z.object({
  tieuDe: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional().nullable(),
  chuDe: z.nativeEnum(ChuDeBaiDang).optional().default(ChuDeBaiDang.THONG_BAO),
  nhanChuong: z.string().max(100, 'Nhãn chương/bài tối đa 100 ký tự').optional().nullable(),
  noiDung: z.string().min(1, 'Nội dung bài đăng không được để trống').max(5000, 'Nội dung tối đa 5000 ký tự'),
  ghimDauTrang: z.boolean().optional().default(false),
});

export type TaoBaiDangInput = z.infer<typeof taoBaiDangSchema>;

export const taoBinhLuanSchema = z.object({
  noiDung: z.string().min(1, 'Nội dung bình luận không được để trống').max(1000, 'Nội dung tối đa 1000 ký tự'),
});

export type TaoBinhLuanInput = z.infer<typeof taoBinhLuanSchema>;

export const danhDauGiaiDapSchema = z.object({
  daGiaiDap: z.boolean(),
  idBinhLuanGiaiDap: z.string().uuid('Mã bình luận không hợp lệ').optional().nullable(),
});

export type DanhDauGiaiDapInput = z.infer<typeof danhDauGiaiDapSchema>;
