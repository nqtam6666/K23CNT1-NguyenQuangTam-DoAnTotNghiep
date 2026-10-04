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
  kichHoat: z.boolean().optional(),
});

/**
 * Schema Zod cập nhật thông tin người dùng (Quản trị viên)
 */
export const capNhatNguoiDungSchema = z.object({
  hoTen: z.string().trim().min(2).max(100).optional(),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/)
    .optional()
    .nullable(),
  vaiTro: z.nativeEnum(VaiTro).optional(),
  kichHoat: z.boolean().optional(),
});

/**
 * Schema Zod bật/tắt kích hoạt tài khoản người dùng
 */
export const chuyenTrangThaiNguoiDungSchema = z.object({
  kichHoat: z.boolean({ required_error: 'Trạng thái kích hoạt là bắt buộc' }),
  lyDo: z.string().trim().max(255).optional(),
});

/**
 * Schema Zod Quản trị viên đặt lại mật khẩu cho người dùng
 */
export const datLaiMatKhauAdminSchema = z.object({
  matKhauMoi: z
    .string({ required_error: 'Mật khẩu mới không được để trống' })
    .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
    .max(100),
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
export type ChuyenTrangThaiNguoiDungDto = z.infer<typeof chuyenTrangThaiNguoiDungSchema>;
export type DatLaiMatKhauAdminDto = z.infer<typeof datLaiMatKhauAdminSchema>;
export type TruyVanNguoiDungDto = z.infer<typeof truyVanNguoiDungSchema>;
