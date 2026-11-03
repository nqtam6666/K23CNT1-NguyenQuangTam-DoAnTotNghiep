'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { dangNhapSchema, DangNhapDto } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';
import { ToggleTheme } from '@/components/ui/toggle-theme';

const MAT_KHAU_MAU = 'MatKhau@123';

const TAI_KHOAN_MAU = [
  { vaiTro: 'Quản trị viên', email: 'admin@lms.edu.vn' },
  { vaiTro: 'Giáo vụ', email: 'giaovu@lms.edu.vn' },
  { vaiTro: 'Giảng viên', email: 'giaovien1@lms.edu.vn' },
  { vaiTro: 'Sinh viên', email: 'hocsinh1@lms.edu.vn' },
  { vaiTro: 'Phụ huynh', email: 'phuhuynh1@lms.edu.vn' },
];

export default function TrangDangNhap() {
  const queryClient = useQueryClient();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [emailMauChon, setEmailMauChon] = useState<string | null>(null);
  const [loiDangNhap, setLoiDangNhap] = useState<string | null>(null);

  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLopKhoa = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const thongBaoChung = layGiaTri('THONG_BAO_CHUNG');
  const urlLogo = layGiaTri('URL_LOGO') || layGiaTri('URL_ICON');
  const chuVietTat = tenHeThong
    .split(/\s+/)
    .slice(0, 2)
    .map((t) => t.charAt(0))
    .join('')
    .toUpperCase();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DangNhapDto>({
    resolver: zodResolver(dangNhapSchema),
    defaultValues: { email: '', matKhau: '' },
  });

  const xuLyChonTaiKhoanMau = (email: string, vaiTro: string) => {
    setEmailMauChon(email);
    setLoiDangNhap(null);
    setValue('email', email, { shouldValidate: true });
    setValue('matKhau', MAT_KHAU_MAU, { shouldValidate: true });
    thongBao.thongTin('Đã điền tài khoản mẫu', `${vaiTro} · ${email}`);
  };

  const xuLyDangNhap = async (duLieu: DangNhapDto) => {
    setDangXuLy(true);
    setLoiDangNhap(null);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', duLieu);
      const nguoiDungMoi = phanHoi.data?.duLieu?.nguoiDung || phanHoi.data?.nguoiDung;

      try {
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
        localStorage.removeItem('lms_cache_bang_dieu_khien');
        if (nguoiDungMoi) {
          const chuoiHoSo = JSON.stringify(nguoiDungMoi);
          sessionStorage.setItem('lms_cache_ho_so', chuoiHoSo);
          localStorage.setItem('lms_cache_ho_so', chuoiHoSo);
        } else {
          sessionStorage.removeItem('lms_cache_ho_so');
          localStorage.removeItem('lms_cache_ho_so');
        }
      } catch {
        // Bỏ qua lỗi bộ nhớ trình duyệt
      }

      queryClient.clear();
      await queryClient.invalidateQueries();

      thongBao.thanhCong(
        'Đăng nhập thành công',
        nguoiDungMoi?.hoTen ? `Xin chào ${nguoiDungMoi.hoTen}.` : 'Đang chuyển vào bảng điều khiển.',
      );

      setTimeout(() => {
        window.location.href = '/bang-dieu-khien';
      }, 500);
    } catch (loi: unknown) {
      const err = loi as { response?: { data?: { thongDiep?: string; message?: string } } };
      const thongDiep =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        'Email hoặc mật khẩu không đúng. Kiểm tra lại hoặc dùng mục Quên mật khẩu.';
      setLoiDangNhap(thongDiep);
      thongBao.thatBai('Đăng nhập thất bại', thongDiep);
    } finally {
      setDangXuLy(false);
    }
  };

  const lopONhap = (coLoi: boolean) =>
    `w-full h-[42px] pl-[38px] pr-10 border rounded-[var(--radius)] bg-[var(--surface)] text-sm text-[var(--text)] outline-none transition-colors ${
      coLoi ? 'border-[var(--danger)]' : 'border-[var(--border)] focus:border-[var(--accent)]'
    }`;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[5fr_7fr] bg-[var(--bg)] text-[var(--text)]">
      {/* Cột giới thiệu */}
      <aside className="hidden lg:flex flex-col justify-between px-12 py-10 bg-[var(--accent)] text-[var(--accent-foreground)] dark:bg-[var(--surface)] dark:text-[var(--text)] dark:border-r dark:border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-[34px] h-[34px] rounded-[var(--radius)] bg-[var(--accent-foreground)] text-[var(--accent)] dark:bg-[var(--accent)] dark:text-[var(--accent-foreground)] grid place-items-center font-mono font-bold text-[13px] overflow-hidden">
            {urlLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urlLogo} alt={tenHeThong} className="w-full h-full object-contain bg-[var(--surface)]" />
            ) : (
              chuVietTat
            )}
          </span>
          <span>
            <span className="block font-semibold text-[15px] leading-tight">{tenHeThong}</span>
            <span className="block font-mono text-[11px] leading-tight opacity-75">{tenTruong}</span>
          </span>
        </Link>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] opacity-75">Cổng học vụ</p>
          <h2 className="mt-3 text-[30px] leading-[1.22] tracking-[-0.02em] font-semibold max-w-[14ch] text-[var(--accent-foreground)] dark:text-[var(--text)]">
            Đăng nhập để vào lớp học của bạn.
          </h2>
          <p className="mt-3.5 text-sm opacity-85 max-w-[40ch]">
            Lịch học, bài tập, điểm danh và trợ lý học tập dùng chung một tài khoản do nhà trường cấp.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {thongBaoChung && (
            <div className="border border-[var(--accent-foreground)]/30 dark:border-[var(--border)] dark:bg-[var(--bg)] rounded-[var(--radius)] px-4 py-3.5 text-[13px]">
              <p className="font-semibold mb-1">Thông báo học vụ</p>
              <p>{thongBaoChung}</p>
            </div>
          )}
          <p className="font-mono text-[11px] opacity-75">
            © 2026 · {maLopKhoa} · {tacGia}
          </p>
        </div>
      </aside>

      {/* Cột biểu mẫu */}
      <main className="flex flex-col px-6 sm:px-10 py-6">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-[34px] px-2.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Trang chủ
          </Link>
          <ToggleTheme />
        </div>

        <div className="w-full max-w-[420px] m-auto py-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Đăng nhập</h1>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">Dùng email và mật khẩu do nhà trường cấp.</p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(xuLyDangNhap)} noValidate>
            {loiDangNhap && (
              <div
                role="alert"
                className="flex gap-2.5 px-3 py-2.5 rounded-[var(--radius)] bg-[var(--danger-soft)] text-[var(--danger)] text-[13px]"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                <p className="text-[var(--text)]">{loiDangNhap}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold mb-1.5">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" strokeWidth={1.5} />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="ten@lms.edu.vn"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                  className={lopONhap(Boolean(errors.email))}
                />
              </div>
              {errors.email && (
                <p role="alert" className="mt-1.5 text-xs text-[var(--danger)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="matKhau" className="text-[13px] font-semibold">
                  Mật khẩu
                </label>
                <Link href="/quen-mat-khau" className="text-[13px] font-medium text-[var(--accent)] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[var(--muted)] pointer-events-none" strokeWidth={1.5} />
                <input
                  id="matKhau"
                  type={hienMatKhau ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  aria-invalid={Boolean(errors.matKhau)}
                  {...register('matKhau')}
                  className={lopONhap(Boolean(errors.matKhau))}
                />
                <button
                  type="button"
                  onClick={() => setHienMatKhau((v) => !v)}
                  aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-1.5 w-[30px] h-[30px] grid place-items-center rounded-[4px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  {hienMatKhau ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.matKhau && (
                <p role="alert" className="mt-1.5 text-xs text-[var(--danger)]">
                  {errors.matKhau.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={dangXuLy}
              className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[13px] font-semibold hover:brightness-95 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {dangXuLy && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
              {dangXuLy ? 'Đang xác thực' : 'Đăng nhập'}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-6 mb-3 text-xs text-[var(--muted)] before:content-[''] before:flex-1 before:h-px before:bg-[var(--border)] after:content-[''] after:flex-1 after:h-px after:bg-[var(--border)]">
            Tài khoản thử nghiệm
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TAI_KHOAN_MAU.map((tk, i) => (
              <button
                key={tk.email}
                type="button"
                aria-pressed={emailMauChon === tk.email}
                onClick={() => xuLyChonTaiKhoanMau(tk.email, tk.vaiTro)}
                className={`text-left px-3 py-2.5 border rounded-[var(--radius)] bg-[var(--surface)] transition-colors cursor-pointer ${
                  emailMauChon === tk.email
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--border)] hover:border-[var(--muted)]'
                } ${i === TAI_KHOAN_MAU.length - 1 && TAI_KHOAN_MAU.length % 2 === 1 ? 'col-span-2' : ''}`}
              >
                <span className="block text-[13px] font-semibold">{tk.vaiTro}</span>
                <span className="block font-mono text-[11px] text-[var(--muted)]">{tk.email}</span>
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-[var(--muted)] text-center">
            Mật khẩu chung: <span className="font-mono text-[var(--text)]">{MAT_KHAU_MAU}</span>
          </p>

          <p className="mt-6 text-[13px] text-[var(--muted)] text-center">
            {choPhepDangKy ? (
              <>
                Chưa có tài khoản?{' '}
                <Link href="/dang-ky" className="font-semibold text-[var(--accent)] hover:underline">
                  Đăng ký sinh viên
                </Link>
              </>
            ) : (
              'Cổng tự đăng ký đang đóng. Liên hệ Phòng Giáo vụ để được cấp tài khoản.'
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
