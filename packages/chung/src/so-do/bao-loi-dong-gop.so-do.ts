import { z } from 'zod';
import {
  LoaiBaoLoiDongGop,
  MucDoUuTienBaoLoi,
  TrangThaiBaoLoi,
} from '../hang-so/trang-thai.hang-so';

/**
 * Schema tạo báo lỗi / đóng góp ý kiến mới
 */
export const taoBaoLoiDongGopSchema = z.object({
  tieuDe: z
    .string({ required_error: 'Tiêu đề là bắt buộc' })
    .trim()
    .min(3, 'Tiêu đề tối thiểu 3 ký tự')
    .max(200, 'Tiêu đề tối đa 200 ký tự'),
  noiDung: z
    .string({ required_error: 'Nội dung mô tả là bắt buộc' })
    .trim()
    .min(10, 'Nội dung mô tả chi tiết tối thiểu 10 ký tự')
    .max(5000, 'Nội dung mô tả tối đa 5.000 ký tự'),
  loaiPhanHoi: z
    .nativeEnum(LoaiBaoLoiDongGop, {
      required_error: 'Loại phản hồi là bắt buộc',
    })
    .default(LoaiBaoLoiDongGop.BAO_LOI),
  mucDoUuTien: z
    .nativeEnum(MucDoUuTienBaoLoi)
    .default(MucDoUuTienBaoLoi.TRUNG_BINH),
  anhDinhKem: z.string().trim().max(500).optional().nullable(),
  thongTinTrinhDuyet: z.string().trim().max(255).optional().nullable(),
});

export type TaoBaoLoiDongGopInput = z.infer<typeof taoBaoLoiDongGopSchema>;

/**
 * Schema xử lý báo lỗi / đóng góp (Dành cho Quản trị viên)
 */
export const xuLyBaoLoiDongGopSchema = z.object({
  trangThai: z.nativeEnum(TrangThaiBaoLoi, {
    required_error: 'Trạng thái xử lý là bắt buộc',
  }),
  phanHoiXuLy: z
    .string({ required_error: 'Phản hồi xử lý là bắt buộc' })
    .trim()
    .min(1, 'Phản hồi xử lý không được để trống')
    .max(5000, 'Phản hồi xử lý tối đa 5.000 ký tự'),
});

export type XuLyBaoLoiDongGopInput = z.infer<typeof xuLyBaoLoiDongGopSchema>;

/**
 * Schema bộ lọc danh sách báo lỗi / đóng góp
 */
export const boLocBaoLoiDongGopSchema = z.object({
  loaiPhanHoi: z.nativeEnum(LoaiBaoLoiDongGop).optional(),
  trangThai: z.nativeEnum(TrangThaiBaoLoi).optional(),
  mucDoUuTien: z.nativeEnum(MucDoUuTienBaoLoi).optional(),
  tuKhoa: z.string().trim().optional(),
  trang: z.coerce.number().int().positive().default(1),
  kichThuoc: z.coerce.number().int().positive().max(100).default(10),
});

export type BoLocBaoLoiDongGopInput = z.infer<typeof boLocBaoLoiDongGopSchema>;
