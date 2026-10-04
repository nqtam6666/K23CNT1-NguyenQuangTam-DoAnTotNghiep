'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Lock, Mail, Loader2 } from 'lucide-react';
import { dangNhapSchema, DangNhapDto } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';

export default function TrangDangNhap() {
  const router = useRouter();
  const [dangXuLy, setDangXuLy] = useState(false);
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'LMS Trường Học');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Quản lý Học tập & Lớp học Trực tuyến');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DangNhapDto>({
    resolver: zodResolver(dangNhapSchema),
    defaultValues: {
      email: '',
      matKhau: '',
    },
  });

  const xuLyDangNhap = async (duLieu: DangNhapDto) => {
    setDangXuLy(true);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', duLieu);
      const hoTen = phanHoi.data?.duLieu?.nguoiDung?.hoTen;

      thongBao.thanhCong(
        'Đăng nhập thành công!',
        hoTen ? `Chào mừng ${hoTen} quay trở lại LMS.` : 'Đang chuyển hướng vào hệ thống...',
      );

      // Đợi hiệu ứng toast mượt mà trước khi chuyển trang
      setTimeout(() => {
        router.push('/bang-dieu-khien');
      }, 700);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Đăng nhập {tenHeThong}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{khauHieu}</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(xuLyDangNhap)}>
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
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                type="password"
                {...register('matKhau')}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.matKhau && (
              <p className="mt-1 text-xs text-red-600">{errors.matKhau.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={dangXuLy}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
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

        {choPhepDangKy ? (
          <div className="text-center pt-2 text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link href="/dang-ky" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký tài khoản học sinh
            </Link>
          </div>
        ) : (
          <div className="text-center pt-2 text-xs text-slate-400">
            Cổng đăng ký trực tuyến hiện đang đóng bởi Quản trị viên
          </div>
        )}
      </div>
    </div>
  );
}
