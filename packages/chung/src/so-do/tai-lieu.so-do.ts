import { z } from 'zod';
import { LoaiTaiLieu } from '../hang-so/trang-thai.hang-so';

export const taoTaiLieuSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  moTa: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').optional().nullable(),
  loaiTaiLieu: z.nativeEnum(LoaiTaiLieu).optional().default(LoaiTaiLieu.TAI_LIEU_THAM_KHAO),
});

export type TaoTaiLieuInput = z.infer<typeof taoTaiLieuSchema>;
