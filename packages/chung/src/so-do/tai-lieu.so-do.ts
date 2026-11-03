import { z } from 'zod';
import { LoaiTaiLieu } from '../hang-so/trang-thai.hang-so';

export const taoTaiLieuSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  moTa: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').optional().nullable(),
  loaiTaiLieu: z.nativeEnum(LoaiTaiLieu).optional().default(LoaiTaiLieu.TAI_LIEU_THAM_KHAO),
});

export type TaoTaiLieuInput = z.infer<typeof taoTaiLieuSchema>;

export const danhGiaTaiLieuSchema = z.object({
  soSao: z.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  nhanXet: z.string().max(1000, 'Nhận xét tối đa 1000 ký tự').optional().nullable(),
});

export type DanhGiaTaiLieuInput = z.infer<typeof danhGiaTaiLieuSchema>;

export const capNhatPhienBanTaiLieuSchema = z.object({
  tieuDe: z.string().max(200, 'Tiêu đề tối đa 200 ký tự').optional(),
  moTa: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').optional().nullable(),
  ghiChuThayDoi: z.string().min(1, 'Vui lòng nhập ghi chú thay đổi phiên bản').max(500, 'Ghi chú tối đa 500 ký tự'),
});

export type CapNhatPhienBanTaiLieuInput = z.infer<typeof capNhatPhienBanTaiLieuSchema>;

export const khoiPhucPhienBanTaiLieuSchema = z.object({
  soPhienBan: z.number().int().min(1, 'Số phiên bản không hợp lệ'),
});

export type KhoiPhucPhienBanTaiLieuInput = z.infer<typeof khoiPhucPhienBanTaiLieuSchema>;
