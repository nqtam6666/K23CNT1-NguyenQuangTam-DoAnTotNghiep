'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Search,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import { taoNguoiDungSchema, TaoNguoiDungDto, VaiTro, DANH_SACH_VAI_TRO, layNhanVaiTro } from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { KhungXuongBang } from '../../../thanh-phan/khung-xuong';

export default function TrangQuanLyNguoiDung() {
  const queryClient = useQueryClient();
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tuKhoa, setTuKhoa] = useState('');
  const [vaiTroLoc, setVaiTroLoc] = useState<string>('');
  const [modalTaoMo, setModalTaoMo] = useState(false);
  const [modalDatMatKhauMo, setModalDatMatKhauMo] = useState<string | null>(null);
  const [matKhauMoi, setMatKhauMoi] = useState('');

  // 1. Fetch danh sách người dùng
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['danhSachNguoiDung', trangHienTai, tuKhoa, vaiTroLoc],
    queryFn: async () => {
      const params = new URLSearchParams({
        trang: String(trangHienTai),
        kichThuoc: '10',
      });
      if (tuKhoa) params.append('tuKhoa', tuKhoa);
      if (vaiTroLoc) params.append('vaiTro', vaiTroLoc);

      const res = await mayKhachApi.get(`/nguoi-dung?${params.toString()}`);
      return res.data?.duLieu;
    },
  });

  // 2. Mutation chuyển đổi trạng thái Khóa / Mở
  const mutationChuyenTrangThai = useMutation({
    mutationFn: async ({ id, kichHoat }: { id: string; kichHoat: boolean }) => {
      await mayKhachApi.patch(`/nguoi-dung/${id}/trang-thai`, { kichHoat });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      thongBao.thanhCong(
        variables.kichHoat ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
        'Cập nhật trạng thái người dùng thành công.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi cập nhật trạng thái người dùng');
    },
  });

  // 3. Mutation đặt lại mật khẩu
  const mutationDatLaiMatKhau = useMutation({
    mutationFn: async ({ id, matKhauMoi }: { id: string; matKhauMoi: string }) => {
      await mayKhachApi.post(`/nguoi-dung/${id}/dat-lai-mat-khau`, { matKhauMoi });
    },
    onSuccess: () => {
      setModalDatMatKhauMo(null);
      setMatKhauMoi('');
      thongBao.thanhCong('Đặt lại mật khẩu thành công', 'Mật khẩu mới đã được cập nhật.');
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi đặt lại mật khẩu');
    },
  });

  // 4. Form tạo người dùng mới
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoNguoiDungDto>({
    resolver: zodResolver(taoNguoiDungSchema),
    defaultValues: {
      email: '',
      matKhau: '',
      hoTen: '',
      soDienThoai: '',
      vaiTro: VaiTro.HOC_SINH,
    },
  });

  const xuLyTaoNguoiDung = async (duLieu: TaoNguoiDungDto) => {
    try {
      await mayKhachApi.post('/nguoi-dung', duLieu);
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      setModalTaoMo(false);
      reset();
      thongBao.thanhCong('Tạo tài khoản thành công', `Tài khoản ${duLieu.email} đã được tạo.`);
    } catch (loi: any) {
      thongBao.loiHeThong(loi, 'Lỗi khi tạo người dùng mới');
    }
  };

  const layMauBadgeVaiTro = (vaiTro: string) => {
    switch (vaiTro) {
      case 'QUAN_TRI_VIEN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'BAN_GIAM_HIEU':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'GIAO_VU':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'GIAO_VIEN':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'HOC_SINH':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'PHU_HUYNH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút Thao tác */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Người dùng</h2>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý tài khoản, phân quyền vai trò và trạng thái hoạt động trong hệ thống LMS
          </p>
        </div>
        <button
          onClick={() => setModalTaoMo(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            value={tuKhoa}
            onChange={(e) => {
              setTuKhoa(e.target.value);
              setTrangHienTai(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={vaiTroLoc}
            onChange={(e) => {
              setVaiTroLoc(e.target.value);
              setTrangHienTai(1);
            }}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Tất cả vai trò --</option>
            {DANH_SACH_VAI_TRO.map((vt) => (
              <option key={vt} value={vt}>
                {layNhanVaiTro(vt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Dữ liệu người dùng */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <KhungXuongBang soDong={6} soCot={6} />
        ) : isError ? (
          <div className="p-8 text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Không thể tải danh sách người dùng.</p>
          </div>
        ) : data?.danhSach?.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">Chưa tìm thấy người dùng nào</p>
            <p className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc thêm tài khoản mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.danhSach?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200">
                          {item.hoTen?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{item.hoTen}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">{item.soDienThoai || 'Chưa cập nhật'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${layMauBadgeVaiTro(
                          item.vaiTro,
                        )}`}
                      >
                        {layNhanVaiTro(item.vaiTro)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.kichHoat ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setModalDatMatKhauMo(item.id)}
                          title="Đặt lại mật khẩu"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            mutationChuyenTrangThai.mutate({
                              id: item.id,
                              kichHoat: !item.kichHoat,
                            })
                          }
                          title={item.kichHoat ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          className={`p-1.5 rounded-md transition-colors ${
                            item.kichHoat
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {item.kichHoat ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Thanh Phân Trang */}
        {data && data.tongSoTrang > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị trang {data.trangHienTai} / {data.tongSoTrang} ({data.tongSo} người dùng)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={trangHienTai <= 1}
                onClick={() => setTrangHienTai((p) => Math.max(p - 1, 1))}
                className="p-1.5 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={trangHienTai >= data.tongSoTrang}
                onClick={() => setTrangHienTai((p) => p + 1)}
                className="p-1.5 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo Người Dùng Mới */}
      {modalTaoMo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Thêm người dùng mới</h3>
              <button
                onClick={() => setModalTaoMo(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(xuLyTaoNguoiDung)} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  {...register('hoTen')}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.hoTen && (
                  <p className="mt-1 text-xs text-red-600">{errors.hoTen.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="an.nv@lms.edu.vn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  type="password"
                  {...register('matKhau')}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                {errors.matKhau && (
                  <p className="mt-1 text-xs text-red-600">{errors.matKhau.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  {...register('soDienThoai')}
                  placeholder="0987654321"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vai trò *</label>
                <select
                  {...register('vaiTro')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {DANH_SACH_VAI_TRO.map((vt) => (
                    <option key={vt} value={vt}>
                      {layNhanVaiTro(vt)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalTaoMo(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đặt Lại Mật Khẩu */}
      {modalDatMatKhauMo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Đặt lại mật khẩu</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập mật khẩu mới cho người dùng. Người dùng sẽ bị thu hồi các phiên đăng nhập cũ.
            </p>

            <input
              type="password"
              placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
              value={matKhauMoi}
              onChange={(e) => setMatKhauMoi(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setModalDatMatKhauMo(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Hủy
              </button>
              <button
                disabled={matKhauMoi.length < 8 || mutationDatLaiMatKhau.isPending}
                onClick={() =>
                  mutationDatLaiMatKhau.mutate({
                    id: modalDatMatKhauMo,
                    matKhauMoi,
                  })
                }
                className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
              >
                Xác nhận đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
