'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, Loader2, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { dangNhapSchema, DangNhapDto } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';

const TAI_KHOAN_MAU = [
  {
    vaiTro: 'Quản trị viên',
    email: 'admin@lms.edu.vn',
    matKhau: 'MatKhau@123',
    mauSac: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  },
  {
    vaiTro: 'Giáo vụ',
    email: 'giaovu@lms.edu.vn',
    matKhau: 'MatKhau@123',
    mauSac: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  {
    vaiTro: 'Giáo viên',
    email: 'giaovien1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    mauSac: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  {
    vaiTro: 'Học sinh',
    email: 'hocsinh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    mauSac: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  {
    vaiTro: 'Phụ huynh',
    email: 'phuhuynh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    mauSac: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  },
];

export default function TrangDangNhap() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'LMS Trường Học');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Quản lý Học tập Thế hệ Mới');

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
    setValue('email', email, { shouldValidate: true });
    setValue('matKhau', matKhau, { shouldValidate: true });
    thongBao.thongTin('Đã chọn tài khoản mẫu', `${vaiTro}: ${email}`);
  };

  const xuLyDangNhap = async (duLieu: DangNhapDto) => {
    setDangXuLy(true);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', duLieu);
      const hoTen = phanHoi.data?.duLieu?.nguoiDung?.hoTen;

      // Xóa sạch bộ đệm tài khoản của phiên đăng nhập trước đó và ép tải mới
      queryClient.clear();
      await queryClient.invalidateQueries();

      thongBao.thanhCong(
        'Đăng nhập thành công!',
        hoTen ? `Chào mừng ${hoTen} quay trở lại LMS.` : 'Đang chuyển hướng vào hệ thống...',
      );

      // Đợi hiệu ứng toast mượt mà trước khi chuyển trang hoàn toàn
      setTimeout(() => {
        window.location.href = '/bang-dieu-khien';
      }, 500);
    } catch (loi: any) {
      const thongDiep =
        loi.response?.data?.thongDiep ||
        loi.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.';

      thongBao.thatBai('Đăng nhập thất bại', thongDiep);
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đăng nhập {tenHeThong}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{khauHieu}</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(xuLyDangNhap)}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="ten@truong.edu.vn"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
              <Link
                href="/quen-mat-khau"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={hienMatKhau ? 'text' : 'password'}
                {...register('matKhau')}
                placeholder="Nhập mật khẩu..."
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900"
              />
              <button
                type="button"
                onClick={() => setHienMatKhau(!hienMatKhau)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                tabIndex={-1}
              >
                {hienMatKhau ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.matKhau && (
              <p className="mt-1 text-xs text-red-600">{errors.matKhau.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={dangXuLy}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            {dangXuLy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Bảng tài khoản mẫu điền nhanh cho giảng viên, sinh viên, hội đồng đánh giá */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              Tài khoản mẫu thử nghiệm
            </span>
            <span className="text-[11px] text-slate-400">Click để điền nhanh</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {TAI_KHOAN_MAU.map((tk) => (
              <button
                key={tk.email}
                type="button"
                onClick={() => xuLyChonTaiKhoanMau(tk.email, tk.matKhau, tk.vaiTro)}
                className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-all text-center truncate cursor-pointer ${tk.mauSac}`}
                title={`${tk.vaiTro}: ${tk.email} (Mật khẩu: ${tk.matKhau})`}
              >
                {tk.vaiTro}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400 text-center">
            Mật khẩu mặc định:{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
              MatKhau@123
            </code>{' '}
            (hoặc{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
              Admin@123
            </code>
            )
          </p>
        </div>

        {choPhepDangKy ? (
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link href="/dang-ky" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký tài khoản học sinh
            </Link>
          </div>
        ) : (
          <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-100">
            Cổng đăng ký trực tuyến hiện đang đóng bởi Quản trị viên
          </div>
        )}
      </div>
    </div>
  );
}
