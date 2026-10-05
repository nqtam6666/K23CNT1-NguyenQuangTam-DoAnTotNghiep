import { z } from 'zod';
import { HinhThucNop } from '../hang-so/trang-thai.hang-so';

export const taoBaiTapSchema = z.object({
  tieuDe: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  noiDung: z.string().min(1, 'Nội dung hướng dẫn làm bài không được để trống'),
  hanNop: z.string().datetime({ message: 'Hạn nộp phải là định dạng thời gian ISO chuẩn' }),
  diemToiDa: z.number().min(1, 'Điểm tối đa ít nhất là 1').max(100, 'Điểm tối đa không quá 100').optional().default(10),
  hinhThucNop: z.nativeEnum(HinhThucNop).optional().default(HinhThucNop.TEP_TIN),
});

export type TaoBaiTapInput = z.infer<typeof taoBaiTapSchema>;

export const nopBaiTapSchema = z.object({
  noiDung: z.string().optional().nullable(),
  duongDanTep: z.string().optional().nullable(),
});

export type NopBaiTapInput = z.infer<typeof nopBaiTapSchema>;

export const chamDiemBaiNopSchema = z.object({
  diemSo: z.number().min(0, 'Điểm không thể âm').max(100, 'Điểm không vượt quá 100'),
  nhanXet: z.string().max(2000, 'Nhận xét tối đa 2000 ký tự').optional().nullable(),
});

export type ChamDiemBaiNopInput = z.infer<typeof chamDiemBaiNopSchema>;
