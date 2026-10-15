'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { BookOpen, Mail, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { quenMatKhauSchema, QuenMatKhauDto } from '@lms/chung';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import { NutBam } from '../../../thanh-phan/nut-bam';

export default function TrangQuenMatKhau() {
  const [daGuiYeuCau, setDaGuiYeuCau] = useState(false);
  const [emailDaGui, setEmailDaGui] = useState('');
  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const emailLienHe = layGiaTri('EMAIL_LIEN_HE', 'lienhe@truong.edu.vn');
  const soDienThoai = layGiaTri('SO_DIEN_THOAI', '0987654321');
  const urlLogo = layGiaTri('URL_LOGO');
  const urlIcon = layGiaTri('URL_ICON');
  const urlFavicon = layGiaTri('URL_FAVICON');
  const anhBieuTuong = urlLogo || urlIcon || urlFavicon;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuenMatKhauDto>({
    resolver: zodResolver(quenMatKhauSchema),
    defaultValues: {
      email: '',
    },
  });

  const xuLyGuiYeuCau = async (duLieu: QuenMatKhauDto) => {
    setEmailDaGui(duLieu.email);
    setDaGuiYeuCau(true);
    thongBao.thanhCong(
      'Đã ghi nhận yêu cầu cấp lại mật khẩu',
      `Hướng dẫn hỗ trợ cho địa chỉ ${duLieu.email} đã được hiển thị.`,
    );
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
            <p className="eyebrow">KHÔI PHỤC TÀI KHOẢN</p>
            <h1 className="font-mono text-[20px] font-bold text-[var(--text)] tracking-tight truncate">
              Quên mật khẩu
            </h1>
            <p className="text-xs text-[var(--muted)] truncate">{tenHeThong}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {daGuiYeuCau ? (
            <div className="space-y-4">
              <div className="p-4 rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-start gap-3">
                <CheckCircle2 strokeWidth={1.5} className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-mono font-bold">Đã ghi nhận thông tin tài khoản</p>
                  <p className="text-[var(--text)] leading-relaxed">
                    Yêu cầu đặt lại mật khẩu cho <span className="font-mono font-semibold">{emailDaGui}</span> đã được ghi nhận. Để đảm bảo an toàn học vụ, vui lòng liên hệ bộ phận Giáo vụ hoặc Quản trị viên qua kênh hỗ trợ bên dưới để được cấp mật khẩu mới.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] space-y-2 text-xs">
                <p className="eyebrow">KÊNH HỖ TRỢ HỌC VỤ</p>
                <div className="flex items-center gap-2 font-mono text-[var(--text)]">
                  <Mail strokeWidth={1.5} className="w-4 h-4 text-[var(--accent)]" />
                  <span>{emailLienHe}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[var(--text)]">
                  <Phone strokeWidth={1.5} className="w-4 h-4 text-[var(--accent)]" />
                  <span>{soDienThoai}</span>
                </div>
              </div>

              <Link
                href="/dang-nhap"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--active-bg)] font-mono text-xs font-semibold text-[var(--text)] transition-colors"
              >
                <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
                Quay lại trang đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Nhập địa chỉ email tài khoản học tập của bạn để nhận hướng dẫn cấp lại mật khẩu từ hệ thống.
              </p>

              <form className="space-y-4" onSubmit={handleSubmit(xuLyGuiYeuCau)} noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block font-mono text-[12px] font-semibold text-[var(--text)]"
                  >
                    Địa chỉ Email đã đăng ký
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

                <NutBam type="submit" variant="primary" className="w-full">
                  Gửi yêu cầu khôi phục
                </NutBam>
              </form>

              <div className="text-center pt-3 text-xs text-[var(--muted)] border-t border-[var(--border)]">
                <Link
                  href="/dang-nhap"
                  className="inline-flex items-center gap-1.5 font-mono text-[var(--accent)] hover:underline font-medium"
                >
                  <ArrowLeft strokeWidth={1.5} className="w-3.5 h-3.5" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
