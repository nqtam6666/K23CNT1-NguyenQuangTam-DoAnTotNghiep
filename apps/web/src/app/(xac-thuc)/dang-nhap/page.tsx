'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';
import { dangNhapSchema, DangNhapDto } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import { AnimatedBackground } from '@/components/ui/animated-tabs';
import { NutBam } from '../../../thanh-phan/nut-bam';

const TAI_KHOAN_MAU = [
  {
    vaiTro: 'Quản trị viên',
    email: 'admin@lms.edu.vn',
    matKhau: 'MatKhau@123',
  },
  {
    vaiTro: 'Giáo vụ',
    email: 'giaovu@lms.edu.vn',
    matKhau: 'MatKhau@123',
  },
  {
    vaiTro: 'Giáo viên',
    email: 'giaovien1@lms.edu.vn',
    matKhau: 'MatKhau@123',
  },
  {
    vaiTro: 'Học sinh',
    email: 'hocsinh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
  },
  {
    vaiTro: 'Phụ huynh',
    email: 'phuhuynh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
  },
];

export default function TrangDangNhap() {
  const queryClient = useQueryClient();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [vaiTroMauChon, setVaiTroMauChon] = useState<string | undefined>(undefined);
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo');
  const urlLogo = layGiaTri('URL_LOGO');
  const urlIcon = layGiaTri('URL_ICON');
  const urlFavicon = layGiaTri('URL_FAVICON');
  const anhBieuTuong = urlLogo || urlIcon || urlFavicon;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DangNhapDto>({
    resolver: zodResolver(dangNhapSchema),
    defaultValues: {
      email: '',
      matKhau: '',
    },
  });

  const xuLyChonTaiKhoanMau = (email: string, matKhau: string, vaiTro: string) => {
    setVaiTroMauChon(vaiTro);
    setValue('email', email, { shouldValidate: true });
    setValue('matKhau', matKhau, { shouldValidate: true });
    thongBao.thongTin('Đã chọn tài khoản mẫu', `${vaiTro}: ${email}`);
  };

  const xuLyDangNhap = async (duLieu: DangNhapDto) => {
    setDangXuLy(true);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', duLieu);
      const hoTen = phanHoi.data?.duLieu?.nguoiDung?.hoTen;

      queryClient.clear();
      await queryClient.invalidateQueries();

      thongBao.thanhCong(
        'Đăng nhập thành công',
        hoTen
          ? `Chào mừng ${hoTen} quay trở lại ${tenHeThong}.`
          : 'Đang chuyển hướng vào hệ thống...',
      );

      setTimeout(() => {
        window.location.href = '/bang-dieu-khien';
      }, 500);
    } catch (loi: unknown) {
      const err = loi as { response?: { data?: { thongDiep?: string; message?: string } } };
      const thongDiep =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.';

      thongBao.thatBai('Đăng nhập thất bại', thongDiep);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg text-text px-4 sm:px-6 lg:px-8 py-10">
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
            <p className="eyebrow">CỔNG XÁC THỰC HỌC VỤ</p>
            <h1 className="font-mono text-[20px] font-bold text-[var(--text)] tracking-tight truncate">
              Đăng nhập {tenHeThong}
            </h1>
            <p className="text-xs text-[var(--muted)] truncate">{khauHieu}</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit(xuLyDangNhap)}>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-mono text-[12px] font-semibold text-[var(--text)]"
              >
                Địa chỉ Email
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
                  className="w-full pl-10 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] transition-colors"
                />
              </div>
              {errors.email && (
                <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="matKhau"
                  className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/quen-mat-khau"
                  className="font-mono text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                  <Lock strokeWidth={1.5} className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="matKhau"
                  type={hienMatKhau ? 'text' : 'password'}
                  {...register('matKhau')}
                  placeholder="Nhập mật khẩu..."
                  aria-invalid={Boolean(errors.matKhau)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] transition-colors"
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

            <NutBam type="submit" variant="primary" dangTai={dangXuLy} className="w-full">
              {dangXuLy ? 'Đang xác thực...' : 'Đăng nhập'}
            </NutBam>
          </form>

          {/* Bảng tài khoản mẫu điền nhanh */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--text)]">
                <KeyRound strokeWidth={1.5} className="w-3.5 h-3.5 text-[var(--accent)]" />
                Tài khoản mẫu thử nghiệm
              </span>
              <span className="font-mono text-[11px] text-[var(--muted)]">Chọn để điền nhanh</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <AnimatedBackground
                defaultValue={vaiTroMauChon}
                className="rounded-[var(--radius)] bg-[var(--accent-soft)] border border-[var(--accent)]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
              >
                {TAI_KHOAN_MAU.map((tk) => (
                  <button
                    key={tk.email}
                    data-id={tk.vaiTro}
                    type="button"
                    onClick={() => xuLyChonTaiKhoanMau(tk.email, tk.matKhau, tk.vaiTro)}
                    className={`px-2.5 py-2 rounded-[var(--radius)] border bg-[var(--bg)] hover:border-[var(--accent)] font-mono text-xs font-medium transition-colors justify-center text-center truncate cursor-pointer ${
                      vaiTroMauChon === tk.vaiTro
                        ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)]'
                    }`}
                    title={`${tk.vaiTro}: ${tk.email} (Mật khẩu: ${tk.matKhau})`}
                  >
                    {tk.vaiTro}
                  </button>
                ))}
              </AnimatedBackground>
            </div>

            <p className="text-[11px] text-[var(--muted)] text-center">
              Mật khẩu mặc định:{' '}
              <code className="bg-[var(--active-bg)] px-1.5 py-0.5 rounded-[var(--radius)] text-[var(--text)] font-mono border border-[var(--border)]">
                MatKhau@123
              </code>
            </p>
          </div>

          {choPhepDangKy ? (
            <div className="text-center pt-3 text-xs text-[var(--muted)] border-t border-[var(--border)]">
              Chưa có tài khoản?{' '}
              <Link href="/dang-ky" className="font-mono text-[var(--accent)] hover:underline font-medium">
                Đăng ký tài khoản học sinh
              </Link>
            </div>
          ) : (
            <div className="text-center pt-3 font-mono text-[11px] text-[var(--muted)] border-t border-[var(--border)]">
              Cổng đăng ký trực tuyến hiện đang đóng bởi Quản trị viên
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
