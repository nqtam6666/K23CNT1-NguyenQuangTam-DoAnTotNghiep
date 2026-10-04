import { z } from 'zod';
import { truyVanPhanTrangSchema } from './phan-trang.so-do';

/**
 * Schema Zod tạo hồ sơ học sinh
 */
export const taoHoSoHocSinhSchema = z.object({
  idNguoiDung: z.string().uuid('ID người dùng không hợp lệ'),
  maHocSinh: z
    .string({ required_error: 'Mã học sinh không được để trống' })
    .trim()
    .min(3, 'Mã học sinh tối thiểu 3 ký tự')
    .max(50, 'Mã học sinh tối đa 50 ký tự')
    .toUpperCase(),
  idLopHanhChinh: z.string().uuid('ID lớp hành chính không hợp lệ').optional().nullable(),
  ngaySinh: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD')
    .optional()
    .nullable(),
  diaChi: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự').optional().nullable(),
});

/**
 * Schema Zod cập nhật hồ sơ học sinh
 */
export const capNhatHoSoHocSinhSchema = z.object({
  maHocSinh: z.string().trim().min(3).max(50).toUpperCase().optional(),
  idLopHanhChinh: z.string().uuid().optional().nullable(),
  ngaySinh: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải có định dạng YYYY-MM-DD')
    .optional()
    .nullable(),
  diaChi: z.string().trim().max(255).optional().nullable(),
});

/**
 * Schema Zod truy vấn danh sách hồ sơ học sinh
 */
export const truyVanHoSoHocSinhSchema = truyVanPhanTrangSchema.extend({
  idLopHanhChinh: z.string().uuid().optional(),
});

/**
 * Schema Zod tạo hồ sơ giáo viên
 */
export const taoHoSoGiaoVienSchema = z.object({
  idNguoiDung: z.string().uuid('ID người dùng không hợp lệ'),
  maGiaoVien: z
    .string({ required_error: 'Mã giáo viên không được để trống' })
    .trim()
    .min(3, 'Mã giáo viên tối thiểu 3 ký tự')
    .max(50, 'Mã giáo viên tối đa 50 ký tự')
    .toUpperCase(),
  hocVi: z.string().trim().max(50, 'Học vị tối đa 50 ký tự').optional().nullable(),
  chuyenMon: z.string().trim().max(100, 'Chuyên môn tối đa 100 ký tự').optional().nullable(),
});

/**
 * Schema Zod cập nhật hồ sơ giáo viên
 */
export const capNhatHoSoGiaoVienSchema = z.object({
  maGiaoVien: z.string().trim().min(3).max(50).toUpperCase().optional(),
  hocVi: z.string().trim().max(50).optional().nullable(),
  chuyenMon: z.string().trim().max(100).optional().nullable(),
});

/**
 * Schema Zod thiết lập liên kết phụ huynh - học sinh
 */
export const thietLapLienKetPhuHuynhSchema = z.object({
  idPhuHuynh: z.string().uuid('ID người dùng phụ huynh không hợp lệ'),
  idHocSinh: z.string().uuid('ID hồ sơ học sinh không hợp lệ'),
  moiQuanHe: z
    .string({ required_error: 'Mối quan hệ không được để trống' })
    .trim()
    .min(2, 'Mối quan hệ tối thiểu 2 ký tự')
    .max(50, 'Mối quan hệ tối đa 50 ký tự'), // "Bố", "Mẹ", "Người giám hộ"
});

/**
 * Schema Zod xóa liên kết phụ huynh - học sinh
 */
export const xoaLienKetPhuHuynhSchema = z.object({
  idPhuHuynh: z.string().uuid(),
  idHocSinh: z.string().uuid(),
});

export type TaoHoSoHocSinhDto = z.infer<typeof taoHoSoHocSinhSchema>;
export type CapNhatHoSoHocSinhDto = z.infer<typeof capNhatHoSoHocSinhSchema>;
export type TruyVanHoSoHocSinhDto = z.infer<typeof truyVanHoSoHocSinhSchema>;
export type TaoHoSoGiaoVienDto = z.infer<typeof taoHoSoGiaoVienSchema>;
export type CapNhatHoSoGiaoVienDto = z.infer<typeof capNhatHoSoGiaoVienSchema>;
export type ThietLapLienKetPhuHuynhDto = z.infer<typeof thietLapLienKetPhuHuynhSchema>;
export type XoaLienKetPhuHuynhDto = z.infer<typeof xoaLienKetPhuHuynhSchema>;
