'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { z } from 'zod';
import { BookOpen, Lock, Mail, Eye, EyeOff, User, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';
import { dangKySchema, VaiTro } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import { NutBam } from '../../../thanh-phan/nut-bam';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';

const bieuMauDangKySchema = dangKySchema
  .extend({
    xacNhanMatKhau: z.string({ required_error: 'Vui lòng xác nhận mật khẩu' }).min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((duLieu) => duLieu.matKhau === duLieu.xacNhanMatKhau, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['xacNhanMatKhau'],
  });

type BieuMauDangKyDto = z.infer<typeof bieuMauDangKySchema>;

export default function TrangDangKy() {
  const queryClient = useQueryClient();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [hienXacNhanMatKhau, setHienXacNhanMatKhau] = useState(false);

  const { layGiaTri, choPhepDangKy, isLoading: dangTaiCaiDat } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Quản lý Học tập Trường học');
  const urlLogo = layGiaTri('URL_LOGO');
  const urlIcon = layGiaTri('URL_ICON');
  const urlFavicon = layGiaTri('URL_FAVICON');
  const anhBieuTuong = urlLogo || urlIcon || urlFavicon;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BieuMauDangKyDto>({
    resolver: zodResolver(bieuMauDangKySchema),
    defaultValues: {
      hoTen: '',
      email: '',
      soDienThoai: undefined,
      matKhau: '',
      xacNhanMatKhau: '',
      vaiTro: VaiTro.HOC_SINH,
    },
  });

  const xuLyDangKy = async (duLieu: BieuMauDangKyDto) => {
    setDangXuLy(true);
    try {
      const payload = {
        hoTen: duLieu.hoTen.trim(),
        email: duLieu.email.trim().toLowerCase(),
        matKhau: duLieu.matKhau,
        ...(duLieu.soDienThoai?.trim() ? { soDienThoai: duLieu.soDienThoai.trim() } : {}),
        vaiTro: VaiTro.HOC_SINH,
      };

      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-ky', payload);
      const nguoiDungMoi = phanHoi.data?.duLieu?.nguoiDung || phanHoi.data?.nguoiDung;

      try {
        sessionStorage.removeItem('lms_cache_ho_so');
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
      } catch {
        // Bỏ qua lỗi sessionStorage
      }

      queryClient.clear();
      await queryClient.invalidateQueries();

      thongBao.thanhCong(
        'Đăng ký tài khoản thành công',
        nguoiDungMoi?.hoTen
          ? `Chào mừng ${nguoiDungMoi.hoTen} gia nhập ${tenHeThong}. Đang chuyển vào bảng điều khiển...`
          : 'Tài khoản của bạn đã sẵn sàng. Đang chuyển hướng...',
      );

      setTimeout(() => {
        window.location.href = '/bang-dieu-khien';
      }, 500);
    } catch (loi: unknown) {
      const err = loi as { response?: { data?: { thongDiep?: string; message?: string } } };
      const thongDiep =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        'Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin đã nhập.';

      thongBao.thatBai('Đăng ký thất bại', thongDiep);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-bg text-text px-4 sm:px-6 lg:px-8 py-10">
      <div className="fixed top-4 right-4 z-50">
        <ToggleTheme />
      </div>

      <div className="max-w-md w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
        {/* Header Card */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center gap-3.5">
          {urlLogo || anhBieuTuong ? (
            <div className="w-[44px] h-[44px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlLogo || anhBieuTuong}
                alt={tenHeThong}
                className="w-full h-full object-contain p-1"
              />
            </div>
          ) : (
            <div className="w-[44px] h-[44px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
              <BookOpen strokeWidth={1.5} className="w-[20px] h-[20px]" />
            </div>
          )}

          <div className="min-w-0">
            <p className="eyebrow">CỔNG ĐĂNG KÝ HỌC VIÊN</p>
            <h1 className="font-mono text-[20px] font-bold text-[var(--text)] tracking-tight truncate">
              Tạo tài khoản {tenHeThong}
            </h1>
            <p className="text-xs text-[var(--muted)] truncate">{khauHieu}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {dangTaiCaiDat ? (
            <div className="space-y-4">
              <KhungXuong className="h-10 w-full" />
              <KhungXuong className="h-10 w-full" />
              <KhungXuong className="h-10 w-full" />
              <KhungXuong className="h-10 w-full" />
            </div>
          ) : !choPhepDangKy ? (
            <div className="space-y-4 py-4 text-center">
              <div className="w-11 h-11 mx-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center">
                <ShieldAlert strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="font-mono text-base font-bold text-[var(--text)]">
                  Cổng đăng ký tự do đang tạm đóng
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Hiện tại Quản trị viên đã khóa chức năng tự tạo tài khoản. Vui lòng liên hệ Giáo vụ hoặc Quản trị viên để được cấp tài khoản học tập.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dang-nhap"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--active-bg)] font-mono text-xs font-semibold text-[var(--text)] transition-colors"
                >
                  <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                  Quay lại trang đăng nhập
                </Link>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleSubmit(xuLyDangKy)} noValidate>
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="hoTen"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Họ và tên học viên <span className="text-[var(--danger)]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                      <User strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="hoTen"
                      type="text"
                      {...register('hoTen')}
                      placeholder="Nguyễn Văn A"
                      aria-invalid={Boolean(errors.hoTen)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  {errors.hoTen && (
                    <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                      {errors.hoTen.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Địa chỉ Email <span className="text-[var(--danger)]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                      <Mail strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="ten@truong.edu.vn"
                      aria-invalid={Boolean(errors.email)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  {errors.email && (
                    <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="soDienThoai"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Số điện thoại <span className="text-[var(--muted)] font-normal">(tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                      <Phone strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="soDienThoai"
                      type="tel"
                      {...register('soDienThoai', {
                        setValueAs: (v: string) => (v && v.trim() !== '' ? v.trim() : undefined),
                      })}
                      placeholder="0987654321"
                      aria-invalid={Boolean(errors.soDienThoai)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                  {errors.soDienThoai && (
                    <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                      {errors.soDienThoai.message}
                    </p>
                  )}
                </div>

                {/* Mật khẩu */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="matKhau"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Mật khẩu <span className="text-[var(--danger)]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                      <Lock strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="matKhau"
                      type={hienMatKhau ? 'text' : 'password'}
                      {...register('matKhau')}
                      placeholder="Tối thiểu 8 ký tự..."
                      aria-invalid={Boolean(errors.matKhau)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setHienMatKhau(!hienMatKhau)}
                      aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      title={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                    >
                      {hienMatKhau ? (
                        <EyeOff strokeWidth={1.5} className="w-4 h-4" />
                      ) : (
                        <Eye strokeWidth={1.5} className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.matKhau && (
                    <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                      {errors.matKhau.message}
                    </p>
                  )}
                </div>

                {/* Xác nhận mật khẩu */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="xacNhanMatKhau"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Xác nhận mật khẩu <span className="text-[var(--danger)]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                      <Lock strokeWidth={1.5} className="w-[18px] h-[18px]" />
                    </div>
                    <input
                      id="xacNhanMatKhau"
                      type={hienXacNhanMatKhau ? 'text' : 'password'}
                      {...register('xacNhanMatKhau')}
                      placeholder="Nhập lại mật khẩu..."
                      aria-invalid={Boolean(errors.xacNhanMatKhau)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setHienXacNhanMatKhau(!hienXacNhanMatKhau)}
                      aria-label={hienXacNhanMatKhau ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                      title={hienXacNhanMatKhau ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                    >
                      {hienXacNhanMatKhau ? (
                        <EyeOff strokeWidth={1.5} className="w-4 h-4" />
                      ) : (
                        <Eye strokeWidth={1.5} className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.xacNhanMatKhau && (
                    <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                      {errors.xacNhanMatKhau.message}
                    </p>
                  )}
                </div>

                <NutBam type="submit" variant="primary" dangTai={dangXuLy} className="w-full">
                  {dangXuLy ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản'}
                </NutBam>
              </form>

              <div className="text-center pt-3 text-xs text-[var(--muted)] border-t border-[var(--border)]">
                Đã có tài khoản?{' '}
                <Link
                  href="/dang-nhap"
                  className="font-mono text-[var(--accent)] hover:underline font-medium"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
