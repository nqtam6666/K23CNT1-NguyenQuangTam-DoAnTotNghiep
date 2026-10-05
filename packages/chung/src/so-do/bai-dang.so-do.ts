import { z } from 'zod';

export const taoBaiDangSchema = z.object({
  noiDung: z.string().min(1, 'Nội dung bài đăng không được để trống').max(5000, 'Nội dung tối đa 5000 ký tự'),
  ghimDauTrang: z.boolean().optional().default(false),
});

export type TaoBaiDangInput = z.infer<typeof taoBaiDangSchema>;

export const taoBinhLuanSchema = z.object({
  noiDung: z.string().min(1, 'Nội dung bình luận không được để trống').max(1000, 'Nội dung tối đa 1000 ký tự'),
});

export type TaoBinhLuanInput = z.infer<typeof taoBinhLuanSchema>;
