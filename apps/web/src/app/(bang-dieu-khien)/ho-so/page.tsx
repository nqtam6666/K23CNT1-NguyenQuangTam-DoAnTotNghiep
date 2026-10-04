'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Shield,
  Key,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  School,
} from 'lucide-react';
import { capNhatHoSoSchema, doiMatKhauSchema, CapNhatHoSoDto, DoiMatKhauDto } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';

export default function TrangHoSoCaNhan() {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<'thong-tin' | 'doi-mat-khau'>('thong-tin');
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);

  // 1. Fetch hồ sơ cá nhân
  const { data: hoSo, isLoading } = useQuery({
    queryKey: ['hoSoCaNhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/ca-nhan');
      return res.data?.duLieu;
    },
  });

  // 2. Form cập nhật thông tin cá nhân
  const {
    register: dangKyThongTin,
    handleSubmit: xuLyCapNhatThongTin,
    formState: { isSubmitting: dangLuuThongTin },
  } = useForm<CapNhatHoSoDto>({
    resolver: zodResolver(capNhatHoSoSchema),
    values: {
      hoTen: hoSo?.hoTen || '',
      soDienThoai: hoSo?.soDienThoai || '',
      anhDaiDien: hoSo?.anhDaiDien || '',
    },
  });

  const capNhatThongTin = async (duLieu: CapNhatHoSoDto) => {
    setThongBaoThanhCong(null);
    setThongBaoLoi(null);
    try {
      await mayKhachApi.patch('/ho-so/ca-nhan', duLieu);
      queryClient.invalidateQueries({ queryKey: ['hoSoCaNhan'] });
      setThongBaoThanhCong('Cập nhật thông tin thành công!');
      thongBao.thanhCong(
        'Cập nhật hồ sơ thành công',
        'Thông tin cá nhân đã được lưu vào hệ thống.',
      );
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Không thể cập nhật hồ sơ';
      setThongBaoLoi(msg);
      thongBao.loiHeThong(loi, 'Không thể cập nhật hồ sơ');
    }
  };

  // 3. Form đổi mật khẩu
  const {
    register: dangKyDoiMatKhau,
    handleSubmit: xuLyDoiMatKhau,
    reset: resetFormDoiMatKhau,
    formState: { errors: loiDoiMatKhau, isSubmitting: dangDoiMatKhau },
  } = useForm<DoiMatKhauDto>({
    resolver: zodResolver(doiMatKhauSchema),
  });

  const doiMatKhau = async (duLieu: DoiMatKhauDto) => {
    setThongBaoThanhCong(null);
    setThongBaoLoi(null);
    try {
      await mayKhachApi.post('/xac-thuc/doi-mat-khau', duLieu);
      setThongBaoThanhCong('Đổi mật khẩu thành công!');
      resetFormDoiMatKhau();
      thongBao.thanhCong(
        'Đổi mật khẩu thành công',
        'Mật khẩu bảo vệ tài khoản của bạn đã được thay đổi.',
      );
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Không thể đổi mật khẩu';
      setThongBaoLoi(msg);
      thongBao.loiHeThong(loi, 'Không thể đổi mật khẩu');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tiêu đề */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ Cá nhân</h2>
        <p className="text-sm text-slate-500 mt-1">
          Xem và quản lý thông tin tài khoản, thông tin học vụ và bảo mật
        </p>
      </div>

      {/* Thông báo kết quả */}
      {thongBaoThanhCong && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{thongBaoThanhCong}</span>
        </div>
      )}
      {thongBaoLoi && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{thongBaoLoi}</span>
        </div>
      )}

      {/* Thẻ Hồ sơ tóm tắt */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-2 border-blue-200 shadow-xs">
          {hoSo?.hoTen?.charAt(0) || 'U'}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h3 className="text-xl font-bold text-slate-900">{hoSo?.hoTen}</h3>
          <p className="text-sm text-slate-500">{hoSo?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              {hoSo?.vaiTro}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <button
          onClick={() => {
            setTabHienTai('thong-tin');
            setThongBaoThanhCong(null);
            setThongBaoLoi(null);
          }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            tabHienTai === 'thong-tin'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Thông tin cơ bản
        </button>

        <button
          onClick={() => {
            setTabHienTai('doi-mat-khau');
            setThongBaoThanhCong(null);
            setThongBaoLoi(null);
          }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            tabHienTai === 'doi-mat-khau'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Key className="w-4 h-4" />
          Đổi mật khẩu
        </button>
      </div>

      {/* Tab 1: Cập nhật thông tin */}
      {tabHienTai === 'thong-tin' && (
        <div className="space-y-6">
          <form
            onSubmit={xuLyCapNhatThongTin(capNhatThongTin)}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
          >
            <h4 className="font-bold text-slate-900 text-base mb-2">Chỉnh sửa thông tin liên hệ</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  {...dangKyThongTin('hoTen')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  {...dangKyThongTin('soDienThoai')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email (Cố định theo tài khoản trường cấp)
              </label>
              <input
                type="email"
                disabled
                value={hoSo?.email || ''}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm cursor-not-allowed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={dangLuuThongTin}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {dangLuuThongTin ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>

          {/* Thông tin học vụ mở rộng (nếu có) */}
          {hoSo?.hoSoHocSinh && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Hồ sơ Học vụ Học sinh
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400">Mã học sinh:</span>
                  <p className="font-semibold text-slate-900">{hoSo.hoSoHocSinh.maHocSinh}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Lớp hành chính:</span>
                  <p className="font-semibold text-slate-900">
                    {hoSo.hoSoHocSinh.lopHanhChinh?.tenLop || 'Chưa phân lớp'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Ngày sinh:</span>
                  <p className="font-semibold text-slate-900">
                    {hoSo.hoSoHocSinh.ngaySinh
                      ? new Date(hoSo.hoSoHocSinh.ngaySinh).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Địa chỉ:</span>
                  <p className="font-semibold text-slate-900">
                    {hoSo.hoSoHocSinh.diaChi || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {hoSo?.hoSoGiaoVien && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                Hồ sơ Chuyên môn Giảng viên
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400">Mã giáo viên:</span>
                  <p className="font-semibold text-slate-900">{hoSo.hoSoGiaoVien.maGiaoVien}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Học vị:</span>
                  <p className="font-semibold text-slate-900">
                    {hoSo.hoSoGiaoVien.hocVi || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-400">Bộ môn chuyên môn:</span>
                  <p className="font-semibold text-slate-900">
                    {hoSo.hoSoGiaoVien.chuyenMon || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Đổi mật khẩu */}
      {tabHienTai === 'doi-mat-khau' && (
        <form
          onSubmit={xuLyDoiMatKhau(doiMatKhau)}
          className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 max-w-lg"
        >
          <h4 className="font-bold text-slate-900 text-base mb-2">Đổi mật khẩu bảo mật</h4>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu hiện tại *
            </label>
            <input
              type="password"
              {...dangKyDoiMatKhau('matKhauHienTai')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            {loiDoiMatKhau.matKhauHienTai && (
              <p className="mt-1 text-xs text-red-600">{loiDoiMatKhau.matKhauHienTai.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu mới *
            </label>
            <input
              type="password"
              {...dangKyDoiMatKhau('matKhauMoi')}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            {loiDoiMatKhau.matKhauMoi && (
              <p className="mt-1 text-xs text-red-600">{loiDoiMatKhau.matKhauMoi.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xác nhận mật khẩu mới *
            </label>
            <input
              type="password"
              {...dangKyDoiMatKhau('xacNhanMatKhauMoi')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            {loiDoiMatKhau.xacNhanMatKhauMoi && (
              <p className="mt-1 text-xs text-red-600">{loiDoiMatKhau.xacNhanMatKhauMoi.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={dangDoiMatKhau}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {dangDoiMatKhau && <Loader2 className="w-4 h-4 animate-spin" />}
              Cập nhật mật khẩu
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
