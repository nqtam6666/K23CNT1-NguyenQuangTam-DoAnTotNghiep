'use client';

import { useQuery } from '@tanstack/react-query';
import { HeartHandshake, GraduationCap, School, AlertCircle, Loader2 } from 'lucide-react';
import { mayKhachApi } from '../../../../tien-ich/may-khach-api';

export default function TrangConEmPhuHuynh() {
  const { data: danhSachConEm, isLoading, isError } = useQuery({
    queryKey: ['danhSachConEmPhuHuynh'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/con-em');
      return res.data?.duLieu || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Theo dõi Con em</h2>
        <p className="text-sm text-slate-500 mt-1">
          Danh sách học sinh được liên kết với tài khoản phụ huynh của bạn trong hệ thống trường học
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Đang tải danh sách học sinh liên kết...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-red-600 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Không thể tải danh sách con em.</p>
        </div>
      ) : danhSachConEm.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">Chưa có liên kết học sinh nào</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Vui lòng liên hệ phòng Giáo vụ hoặc Giáo viên chủ nhiệm để xác nhận và thiết lập liên kết
            tài khoản phụ huynh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {danhSachConEm.map((lienKet: any) => {
            const hocSinh = lienKet.hocSinh;
            return (
              <div
                key={lienKet.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 font-bold text-xl flex items-center justify-center border border-blue-200">
                    {hocSinh?.nguoiDung?.hoTen?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {hocSinh?.nguoiDung?.hoTen}
                    </h3>
                    <p className="text-xs text-slate-500">{hocSinh?.nguoiDung?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Mối quan hệ: {lienKet.moiQuanHe}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Mã học sinh:</span>
                    <p className="font-semibold text-slate-800">{hocSinh?.maHocSinh}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Lớp sinh hoạt:</span>
                    <p className="font-semibold text-slate-800">
                      {hocSinh?.lopHanhChinh?.tenLop || 'Chưa xếp lớp'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Khối:</span>
                    <p className="font-semibold text-slate-800">
                      Khối {hocSinh?.lopHanhChinh?.khoiLop || '---'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ngày sinh:</span>
                    <p className="font-semibold text-slate-800">
                      {hocSinh?.ngaySinh
                        ? new Date(hocSinh.ngaySinh).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
