import { z } from 'zod';
import { truyVanPhanTrangSchema } from './phan-trang.so-do';
import { TrangThaiBuoiHoc } from '../hang-so/trang-thai.hang-so';

// ==========================================
// 1. LỚP HỌC PHẦN
// ==========================================

export const taoLopHocPhanSchema = z.object({
  maLopHocPhan: z
    .string({ required_error: 'Mã lớp học phần không được để trống' })
    .min(3, 'Mã lớp học phần tối thiểu 3 ký tự')
    .max(50, 'Mã lớp học phần tối đa 50 ký tự')
    .regex(/^[A-Z0-9_-]+$/, 'Mã lớp học phần chỉ gồm chữ in hoa, số, gạch nối hoặc gạch dưới'),
  tenLopHocPhan: z
    .string({ required_error: 'Tên lớp học phần không được để trống' })
    .min(3, 'Tên lớp học phần tối thiểu 3 ký tự')
    .max(100, 'Tên lớp học phần tối đa 100 ký tự'),
  idMonHoc: z
    .string({ required_error: 'Môn học không được để trống' })
    .uuid('ID môn học phải là UUID hợp lệ'),
  idHocKy: z
    .string({ required_error: 'Học kỳ không được để trống' })
    .uuid('ID học kỳ phải là UUID hợp lệ'),
  idGiaoVien: z
    .string({ required_error: 'Giáo viên phụ trách không được để trống' })
    .uuid('ID hồ sơ giáo viên phải là UUID hợp lệ'),
  moTa: z.string().max(2000, 'Mô tả tối đa 2000 ký tự').optional().nullable(),
  kichHoat: z.boolean().optional(),
});

export const capNhatLopHocPhanSchema = taoLopHocPhanSchema.partial();

export const truyVanLopHocPhanSchema = truyVanPhanTrangSchema.extend({
  tuKhoa: z.string().optional(),
  idHocKy: z.string().uuid().optional(),
  idMonHoc: z.string().uuid().optional(),
  idGiaoVien: z.string().uuid().optional(),
  kichHoat: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => (typeof val === 'string' ? val === 'true' : val))
    .optional(),
});

export type TaoLopHocPhanInput = z.infer<typeof taoLopHocPhanSchema>;
export type CapNhatLopHocPhanInput = z.infer<typeof capNhatLopHocPhanSchema>;
export type TruyVanLopHocPhanInput = z.infer<typeof truyVanLopHocPhanSchema>;

// ==========================================
// 2. GHI DANH HỌC SINH
// ==========================================

export const ghiDanhHocSinhSchema = z.object({
  idHocSinh: z
    .string({ required_error: 'Học sinh không được để trống' })
    .uuid('ID hồ sơ học sinh phải là UUID hợp lệ'),
});

export const ghiDanhNhieuHocSinhSchema = z.object({
  danhSachIdHocSinh: z
    .array(z.string().uuid('ID học sinh phải là UUID hợp lệ'))
    .min(1, 'Danh sách học sinh không được rỗng'),
});

export const ghiDanhTheoLopHanhChinhSchema = z.object({
  idLopHanhChinh: z
    .string({ required_error: 'Lớp hành chính không được để trống' })
    .uuid('ID lớp hành chính phải là UUID hợp lệ'),
});

export type GhiDanhHocSinhInput = z.infer<typeof ghiDanhHocSinhSchema>;
export type GhiDanhNhieuHocSinhInput = z.infer<typeof ghiDanhNhieuHocSinhSchema>;
export type GhiDanhTheoLopHanhChinhInput = z.infer<typeof ghiDanhTheoLopHanhChinhSchema>;

// ==========================================
// 3. THỜI KHÓA BIỂU
// ==========================================

export const taoThoiKhoaBieuSchema = z.object({
  thuTrongTuan: z
    .number({ required_error: 'Thứ trong tuần không được để trống' })
    .int('Thứ phải là số nguyên')
    .min(2, 'Thứ tối thiểu là 2 (Thứ 2)')
    .max(8, 'Thứ tối đa là 8 (Chủ nhật)'),
  tietBatDau: z
    .number({ required_error: 'Tiết bắt đầu không được để trống' })
    .int('Tiết bắt đầu phải là số nguyên')
    .min(1, 'Tiết bắt đầu tối thiểu là 1')
    .max(12, 'Tiết bắt đầu tối đa là 12'),
  soTiet: z
    .number({ required_error: 'Số tiết không được để trống' })
    .int('Số tiết phải là số nguyên')
    .min(1, 'Số tiết tối thiểu là 1')
    .max(5, 'Số tiết một buổi tối đa là 5'),
  phongHoc: z.string().max(50, 'Tên phòng học tối đa 50 ký tự').optional().nullable(),
});

export const capNhatThoiKhoaBieuSchema = taoThoiKhoaBieuSchema.partial();

export type TaoThoiKhoaBieuInput = z.infer<typeof taoThoiKhoaBieuSchema>;
export type CapNhatThoiKhoaBieuInput = z.infer<typeof capNhatThoiKhoaBieuSchema>;

// ==========================================
// 4. BUỔI HỌC
// ==========================================

export const taoBuoiHocSchema = z.object({
  idLopHocPhan: z
    .string({ required_error: 'Lớp học phần không được để trống' })
    .uuid('ID lớp học phần phải là UUID hợp lệ'),
  chuDe: z
    .string({ required_error: 'Chủ đề buổi học không được để trống' })
    .min(2, 'Chủ đề tối thiểu 2 ký tự')
    .max(200, 'Chủ đề tối đa 200 ký tự'),
  thoiGianBD: z
    .string({ required_error: 'Thời gian bắt đầu không được để trống' })
    .refine((val) => !isNaN(Date.parse(val)), 'Thời gian bắt đầu không hợp lệ'),
  thoiGianKT: z
    .string({ required_error: 'Thời gian kết thúc không được để trống' })
    .refine((val) => !isNaN(Date.parse(val)), 'Thời gian kết thúc không hợp lệ'),
  trangThai: z.nativeEnum(TrangThaiBuoiHoc).optional().default(TrangThaiBuoiHoc.CHUA_BAT_DAU),
}).refine(
  (data) => new Date(data.thoiGianBD) < new Date(data.thoiGianKT),
  {
    message: 'Thời gian bắt đầu phải trước thời gian kết thúc',
    path: ['thoiGianKT'],
  }
);

export const capNhatBuoiHocSchema = z.object({
  chuDe: z.string().min(2).max(200).optional(),
  thoiGianBD: z.string().refine((val) => !isNaN(Date.parse(val)), 'Thời gian bắt đầu không hợp lệ').optional(),
  thoiGianKT: z.string().refine((val) => !isNaN(Date.parse(val)), 'Thời gian kết thúc không hợp lệ').optional(),
  trangThai: z.nativeEnum(TrangThaiBuoiHoc).optional(),
});

export type TaoBuoiHocInput = z.infer<typeof taoBuoiHocSchema>;
export type CapNhatBuoiHocInput = z.infer<typeof capNhatBuoiHocSchema>;
