import { z } from 'zod';
import { VaiTro } from '../hang-so/vai-tro.hang-so';
import { truyVanPhanTrangSchema } from './phan-trang.so-do';

/**
 * Schema Zod cập nhật hồ sơ cá nhân
 */
export const capNhatHoSoSchema = z.object({
  hoTen: z.string().trim().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100).optional(),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không đúng định dạng')
    .optional()
    .nullable(),
  anhDaiDien: z.string().url('Đường dẫn ảnh không hợp lệ').optional().nullable(),
});

/**
 * Schema Zod quản trị viên tạo người dùng
 */
export const taoNguoiDungSchema = z.object({
  email: z.string().email('Email không hợp lệ').trim().toLowerCase(),
  matKhau: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  hoTen: z.string().trim().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không đúng định dạng')
    .optional(),
  vaiTro: z.nativeEnum(VaiTro),
  kichHoat: z.boolean().default(true),
});

/**
 * Schema Zod cập nhật thông tin người dùng (Quản trị viên)
 */
export const capNhatNguoiDungSchema = z.object({
  hoTen: z.string().trim().min(2).max(100).optional(),
  soDienThoai: z.string().trim().regex(/^[0-9]{10,11}$/).optional().nullable(),
  vaiTro: z.nativeEnum(VaiTro).optional(),
  kichHoat: z.boolean().optional(),
});

/**
 * Schema Zod truy vấn danh sách người dùng với bộ lọc
 */
export const truyVanNguoiDungSchema = truyVanPhanTrangSchema.extend({
  vaiTro: z.nativeEnum(VaiTro).optional(),
  kichHoat: z.coerce.boolean().optional(),
});

export type CapNhatHoSoDto = z.infer<typeof capNhatHoSoSchema>;
export type TaoNguoiDungDto = z.infer<typeof taoNguoiDungSchema>;
export type CapNhatNguoiDungDto = z.infer<typeof capNhatNguoiDungSchema>;
export type TruyVanNguoiDungDto = z.infer<typeof truyVanNguoiDungSchema>;
