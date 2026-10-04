import { z } from 'zod';
import { truyVanPhanTrangSchema } from './phan-trang.so-do';

// ==========================================
// 1. NĂM HỌC
// ==========================================

export const taoNamHocSchema = z.object({
  tenNamHoc: z
    .string({ required_error: 'Tên năm học không được để trống' })
    .min(1, 'Tên năm học không được để trống')
    .max(50, 'Tên năm học tối đa 50 ký tự')
    .regex(/^\d{4}-\d{4}$/, 'Định dạng năm học phải là YYYY-YYYY (ví dụ: 2025-2026)'),
  hienTai: z.boolean().optional().default(false),
});

export const capNhatNamHocSchema = taoNamHocSchema.partial();

export type TaoNamHocInput = z.infer<typeof taoNamHocSchema>;
export type CapNhatNamHocInput = z.infer<typeof capNhatNamHocSchema>;

// ==========================================
// 2. HỌC KỲ
// ==========================================

export const taoHocKySchema = z
  .object({
    idNamHoc: z
      .string({ required_error: 'Năm học không được để trống' })
      .uuid('ID năm học phải là UUID hợp lệ'),
    tenHocKy: z
      .string({ required_error: 'Tên học kỳ không được để trống' })
      .min(1, 'Tên học kỳ không được để trống')
      .max(50, 'Tên học kỳ tối đa 50 ký tự'),
    hienTai: z.boolean().optional().default(false),
    ngayBatDau: z
      .string({ required_error: 'Ngày bắt đầu không được để trống' })
      .refine((val) => !isNaN(Date.parse(val)), 'Ngày bắt đầu không hợp lệ'),
    ngayKetThuc: z
      .string({ required_error: 'Ngày kết thúc không được để trống' })
      .refine((val) => !isNaN(Date.parse(val)), 'Ngày kết thúc không hợp lệ'),
  })
  .refine((data) => new Date(data.ngayBatDau) < new Date(data.ngayKetThuc), {
    message: 'Ngày bắt đầu phải trước ngày kết thúc',
    path: ['ngayKetThuc'],
  });

export const capNhatHocKySchema = z.object({
  idNamHoc: z.string().uuid('ID năm học phải là UUID hợp lệ').optional(),
  tenHocKy: z.string().min(1).max(50).optional(),
  hienTai: z.boolean().optional(),
  ngayBatDau: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Ngày bắt đầu không hợp lệ')
    .optional(),
  ngayKetThuc: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Ngày kết thúc không hợp lệ')
    .optional(),
});

export type TaoHocKyInput = z.infer<typeof taoHocKySchema>;
export type CapNhatHocKyInput = z.infer<typeof capNhatHocKySchema>;

// ==========================================
// 3. MÔN HỌC
// ==========================================

export const taoMonHocSchema = z.object({
  maMonHoc: z
    .string({ required_error: 'Mã môn học không được để trống' })
    .min(2, 'Mã môn học tối thiểu 2 ký tự')
    .max(50, 'Mã môn học tối đa 50 ký tự')
    .regex(/^[A-Z0-9_-]+$/, 'Mã môn học chỉ gồm chữ in hoa, số, gạch nối hoặc gạch dưới'),
  tenMonHoc: z
    .string({ required_error: 'Tên môn học không được để trống' })
    .min(2, 'Tên môn học tối thiểu 2 ký tự')
    .max(100, 'Tên môn học tối đa 100 ký tự'),
  soTinChi: z
    .number({ required_error: 'Số tín chỉ/tiết học không được để trống' })
    .int('Số tín chỉ phải là số nguyên')
    .min(1, 'Số tín chỉ tối thiểu là 1')
    .max(10, 'Số tín chỉ tối đa là 10'),
  moTa: z.string().max(1000, 'Mô tả tối đa 1000 ký tự').optional().nullable(),
});

export const capNhatMonHocSchema = taoMonHocSchema.partial();

export const truyVanMonHocSchema = truyVanPhanTrangSchema.extend({
  tuKhoa: z.string().optional(),
});

export type TaoMonHocInput = z.infer<typeof taoMonHocSchema>;
export type CapNhatMonHocInput = z.infer<typeof capNhatMonHocSchema>;
export type TruyVanMonHocInput = z.infer<typeof truyVanMonHocSchema>;

// ==========================================
// 4. LỚP HÀNH CHÍNH
// ==========================================

export const taoLopHanhChinhSchema = z.object({
  maLop: z
    .string({ required_error: 'Mã lớp không được để trống' })
    .min(2, 'Mã lớp tối thiểu 2 ký tự')
    .max(50, 'Mã lớp tối đa 50 ký tự')
    .regex(/^[A-Z0-9_-]+$/, 'Mã lớp chỉ gồm chữ in hoa, số, gạch nối hoặc gạch dưới'),
  tenLop: z
    .string({ required_error: 'Tên lớp không được để trống' })
    .min(2, 'Tên lớp tối thiểu 2 ký tự')
    .max(100, 'Tên lớp tối đa 100 ký tự'),
  khoiLop: z
    .number({ required_error: 'Khối lớp không được để trống' })
    .int('Khối lớp phải là số nguyên')
    .min(1, 'Khối lớp tối thiểu là 1')
    .max(12, 'Khối lớp tối đa là 12'),
  idGiaoVienCN: z.string().uuid('ID giáo viên chủ nhiệm phải là UUID hợp lệ').optional().nullable(),
});

export const capNhatLopHanhChinhSchema = taoLopHanhChinhSchema.partial();

export const truyVanLopHanhChinhSchema = truyVanPhanTrangSchema.extend({
  tuKhoa: z.string().optional(),
  khoiLop: z.coerce.number().int().optional(),
});

export type TaoLopHanhChinhInput = z.infer<typeof taoLopHanhChinhSchema>;
export type CapNhatLopHanhChinhInput = z.infer<typeof capNhatLopHanhChinhSchema>;
export type TruyVanLopHanhChinhInput = z.infer<typeof truyVanLopHanhChinhSchema>;
