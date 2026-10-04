import { z } from 'zod';
import { VaiTro } from '../hang-so/vai-tro.hang-so';

/**
 * Schema Zod xác thực đăng nhập
 */
export const dangNhapSchema = z.object({
  email: z
    .string({ required_error: 'Email không được để trống' })
    .email('Định dạng email không hợp lệ')
    .trim()
    .toLowerCase(),
  matKhau: z
    .string({ required_error: 'Mật khẩu không được để trống' })
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự')
    .max(100, 'Mật khẩu không vượt quá 100 ký tự'),
});

/**
 * Schema Zod xác thực đăng ký tài khoản mới
 */
export const dangKySchema = z.object({
  email: z
    .string({ required_error: 'Email không được để trống' })
    .email('Định dạng email không hợp lệ')
    .trim()
    .toLowerCase(),
  matKhau: z
    .string({ required_error: 'Mật khẩu không được để trống' })
    .min(8, 'Mật khẩu bảo mật phải có tối thiểu 8 ký tự')
    .max(100, 'Mật khẩu không vượt quá 100 ký tự'),
  hoTen: z
    .string({ required_error: 'Họ và tên không được để trống' })
    .trim()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),
  soDienThoai: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không đúng định dạng')
    .optional(),
  vaiTro: z.nativeEnum(VaiTro).default(VaiTro.HOC_SINH),
});

/**
 * Schema Zod làm mới token (Refresh Token)
 */
export const lamMoiTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token không được để trống' }).min(1),
});

/**
 * Schema Zod đổi mật khẩu
 */
export const doiMatKhauSchema = z
  .object({
    matKhauHienTai: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    matKhauMoi: z
      .string()
      .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không vượt quá 100 ký tự'),
    xacNhanMatKhauMoi: z.string().min(1, 'Xác nhận mật khẩu mới không được để trống'),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhauMoi, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
    path: ['xacNhanMatKhauMoi'],
  });

/**
 * Schema Zod yêu cầu quên mật khẩu
 */
export const quenMatKhauSchema = z.object({
  email: z.string().email('Định dạng email không hợp lệ').trim().toLowerCase(),
});

/**
 * Schema Zod đặt lại mật khẩu với token khôi phục
 */
export const datLaiMatKhauSchema = z
  .object({
    tokenKhoiPhuc: z.string().min(1, 'Token khôi phục không được để trống'),
    matKhauMoi: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
    xacNhanMatKhauMoi: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.matKhauMoi === data.xacNhanMatKhauMoi, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
    path: ['xacNhanMatKhauMoi'],
  });

export type DangNhapDto = z.infer<typeof dangNhapSchema>;
export type DangKyDto = z.infer<typeof dangKySchema>;
export type LamMoiTokenDto = z.infer<typeof lamMoiTokenSchema>;
export type DoiMatKhauDto = z.infer<typeof doiMatKhauSchema>;
export type QuenMatKhauDto = z.infer<typeof quenMatKhauSchema>;
export type DatLaiMatKhauDto = z.infer<typeof datLaiMatKhauSchema>;
