'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { School, Lock, Mail, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
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
      const nguoiDungMoi = phanHoi.data?.duLieu?.nguoiDung || phanHoi.data?.nguoiDung;
      const hoTen = nguoiDungMoi?.hoTen;

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
    <div className="relative min-h-screen flex flex-col justify-between bg-[var(--bg)] text-[var(--text)] px-4 sm:px-6 lg:px-8 py-6">
      {/* Thanh điều hướng trên cùng */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Trang chủ {tenHeThong}</span>
        </Link>
        <ToggleTheme />
      </div>

      {/* Khối nội dung chính 2 cột mềm mại chuẩn SOFT */}
      <div className="max-w-4xl w-full mx-auto my-6 bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Cột trái: Giới thiệu học vụ ấm áp */}
        <div className="lg:col-span-5 bg-[var(--accent-soft)]/55 border-b lg:border-b-0 lg:border-r border-[var(--border)] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5">
              {urlLogo || anhBieuTuong ? (
                <div className="w-11 h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlLogo || anhBieuTuong}
                    alt={tenHeThong}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-[var(--radius)] bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
                  <School strokeWidth={1.75} className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  {tenTruong}
                </p>
                <p className="font-sans text-base font-semibold text-[var(--text)] leading-tight">
                  {tenHeThong}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="font-sans text-[19px] font-semibold text-[var(--text)] leading-snug">
                Không gian học tập & giảng dạy trực tuyến tập trung
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {khauHieu}. Đồng bộ thời khóa biểu, điểm danh, học liệu, bài tập, sổ điểm và trợ lý học tập trên một nền tảng thống nhất.
              </p>
            </div>

            <ul className="space-y-2.5 pt-2 text-xs text-[var(--text)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 stroke-[1.75]" />
                <span>Lớp học phần, điểm danh PIN và phòng học trực tuyến</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 stroke-[1.75]" />
                <span>Nộp bài tập, luyện tập trắc nghiệm và theo dõi sổ điểm</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 stroke-[1.75]" />
                <span>Trợ lý học tập tra cứu giáo trình có trích dẫn nguồn</span>
              </li>
            </ul>
          </div>

          {/* Khối chọn nhanh tài khoản thử nghiệm */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-[var(--text)]">
                <KeyRound strokeWidth={1.75} className="w-3.5 h-3.5 text-[var(--accent)]" />
                Điền nhanh tài khoản mẫu
              </span>
              <code className="font-mono text-[11px] px-1.5 py-0.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                MatKhau@123
              </code>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5">
              <AnimatedBackground
                defaultValue={vaiTroMauChon}
                className="rounded-[var(--radius)] bg-[var(--accent)]/12 border border-[var(--accent)]"
                transition={{ type: 'spring', bounce: 0.12, duration: 0.22 }}
              >
                {TAI_KHOAN_MAU.map((tk) => (
                  <button
                    key={tk.email}
                    data-id={tk.vaiTro}
                    type="button"
                    onClick={() => xuLyChonTaiKhoanMau(tk.email, tk.matKhau, tk.vaiTro)}
                    className={`px-2.5 py-2 rounded-[var(--radius)] border bg-[var(--surface)] hover:border-[var(--accent)] font-sans text-xs font-medium transition-colors justify-center text-center truncate cursor-pointer ${
                      vaiTroMauChon === tk.vaiTro
                        ? 'border-[var(--accent)] text-[var(--accent)] font-semibold'
                        : 'border-[var(--border)] text-[var(--text)] hover:text-[var(--accent)]'
                    }`}
                    title={`${tk.vaiTro}: ${tk.email}`}
                  >
                    {tk.vaiTro}
                  </button>
                ))}
              </AnimatedBackground>
            </div>
          </div>
        </div>

        {/* Cột phải: Biểu mẫu đăng nhập */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <p className="eyebrow mb-1">CỔNG XÁC THỰC HỌC VỤ</p>
            <h1 className="font-sans text-[22px] sm:text-[24px] font-semibold text-[var(--text)] tracking-tight">
              Đăng nhập tài khoản
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Sử dụng địa chỉ email học vụ của bạn hoặc chọn một vai trò mẫu bên cạnh để trải nghiệm.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(xuLyDangNhap)}>
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-sans text-[13px] font-semibold text-[var(--text)]"
              >
                Địa chỉ Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                  <Mail strokeWidth={1.75} className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="ten@lms.edu.vn"
                  aria-invalid={Boolean(errors.email)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] transition-colors"
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
                  className="block font-sans text-[13px] font-semibold text-[var(--text)]"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/quen-mat-khau"
                  className="font-sans text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                  <Lock strokeWidth={1.75} className="w-[18px] h-[18px]" />
                </div>
                <input
                  id="matKhau"
                  type={hienMatKhau ? 'text' : 'password'}
                  {...register('matKhau')}
                  placeholder="Nhập mật khẩu của bạn..."
                  aria-invalid={Boolean(errors.matKhau)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setHienMatKhau(!hienMatKhau)}
                  aria-label={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  title={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  {hienMatKhau ? (
                    <EyeOff strokeWidth={1.75} className="w-4 h-4" />
                  ) : (
                    <Eye strokeWidth={1.75} className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.matKhau && (
                <p role="alert" className="text-xs text-[var(--danger)] font-medium">
                  {errors.matKhau.message}
                </p>
              )}
            </div>

            <div className="pt-1">
              <NutBam type="submit" variant="primary" dangTai={dangXuLy} className="w-full py-2.5">
                {dangXuLy ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
              </NutBam>
            </div>
          </form>

          {choPhepDangKy ? (
            <div className="text-center mt-6 pt-4 text-xs text-[var(--muted)] border-t border-[var(--border)]">
              Chưa có tài khoản học viên?{' '}
              <Link href="/dang-ky" className="font-sans text-[var(--accent)] hover:underline font-semibold">
                Đăng ký tài khoản mới
              </Link>
            </div>
          ) : (
            <div className="text-center mt-6 pt-4 font-sans text-xs text-[var(--muted)] border-t border-[var(--border)]">
              Cổng tự đăng ký hiện đang đóng. Vui lòng liên hệ Phòng Giáo vụ để được cấp tài khoản.
            </div>
          )}
        </div>
      </div>

      {/* Chân trang nhỏ gọn */}
      <div className="max-w-5xl w-full mx-auto text-center text-xs text-[var(--muted)]">
        <span>{tenHeThong} · {tenTruong}</span>
      </div>
    </div>
  );
}
