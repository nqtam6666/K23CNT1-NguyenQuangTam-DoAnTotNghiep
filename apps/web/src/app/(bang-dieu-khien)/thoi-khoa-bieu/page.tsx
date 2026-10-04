'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Clock,
  Printer,
  BookOpen,
  MapPin,
  User,
  Filter,
  Layers,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { ThoiKhoaBieu, HocKy } from '@lms/chung';

export default function TrangThoiKhoaBieu() {
  const [idHocKyLoc, setIdHocKyLoc] = useState<string>('');

  // Lấy danh sách học kỳ để lọc
  const { data: danhSachHocKy } = useQuery<HocKy[]>({
    queryKey: ['hoc-ky-loc'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/hoc-ky');
      return res.data.duLieu || [];
    },
  });

  // Lấy thời khóa biểu cá nhân
  const { data: danhSachTkb, isLoading } = useQuery<ThoiKhoaBieu[]>({
    queryKey: ['tkb-ca-nhan', idHocKyLoc],
    queryFn: async () => {
      const res = await mayKhachApi.get('/thoi-khoa-bieu/ca-nhan', {
        params: idHocKyLoc ? { idHocKy: idHocKyLoc } : undefined,
      });
      return res.data.duLieu || [];
    },
  });

  const cacThu = [
    { ma: 2, ten: 'Thứ Hai' },
    { ma: 3, ten: 'Thứ Ba' },
    { ma: 4, ten: 'Thứ Tư' },
    { ma: 5, ten: 'Thứ Năm' },
    { ma: 6, ten: 'Thứ Sáu' },
    { ma: 7, ten: 'Thứ Bảy' },
    { ma: 8, ten: 'Chủ Nhật' },
  ];

  const cacTiet = [
    { tiet: 1, gio: '07:00 - 07:45', buoi: 'Sáng' },
    { tiet: 2, gio: '07:50 - 08:35', buoi: 'Sáng' },
    { tiet: 3, gio: '08:40 - 09:25', buoi: 'Sáng' },
    { tiet: 4, gio: '09:35 - 10:20', buoi: 'Sáng' },
    { tiet: 5, gio: '10:25 - 11:10', buoi: 'Sáng' },
    { tiet: 6, gio: '13:00 - 13:45', buoi: 'Chiều' },
    { tiet: 7, gio: '13:50 - 14:35', buoi: 'Chiều' },
    { tiet: 8, gio: '14:40 - 15:25', buoi: 'Chiều' },
    { tiet: 9, gio: '15:35 - 16:20', buoi: 'Chiều' },
    { tiet: 10, gio: '16:25 - 17:10', buoi: 'Chiều' },
  ];

  // Bảng màu cho các thẻ môn học
  const mauThe = [
    'bg-indigo-50 border-indigo-200 text-indigo-900',
    'bg-emerald-50 border-emerald-200 text-emerald-900',
    'bg-amber-50 border-amber-200 text-amber-900',
    'bg-rose-50 border-rose-200 text-rose-900',
    'bg-violet-50 border-violet-200 text-violet-900',
    'bg-sky-50 border-sky-200 text-sky-900',
  ];

  // Tìm tiết học bắt đầu tại tiết và thứ cụ thể
  const timTietHoc = (thu: number, tiet: number) => {
    return danhSachTkb?.find((tkb) => tkb.thuTrongTuan === thu && tkb.tietBatDau === tiet);
  };

  // Kiểm tra xem một tiết có bị gộp bởi tiết trước không
  const biGopTiet = (thu: number, tiet: number) => {
    return danhSachTkb?.some(
      (tkb) =>
        tkb.thuTrongTuan === thu &&
        tkb.tietBatDau < tiet &&
        tkb.tietBatDau + tkb.soTiet > tiet,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thời khóa biểu tuần</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lịch học tập và giảng dạy hàng tuần được đồng bộ tự động từ hệ thống quản lý học vụ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Lọc theo học kỳ */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={idHocKyLoc}
              onChange={(e) => setIdHocKyLoc(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="">-- Tất cả học kỳ --</option>
              {danhSachHocKy?.map((hk) => (
                <option key={hk.id} value={hk.id}>
                  {hk.tenHocKy} {hk.hienTai ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            In lịch
          </button>
        </div>
      </div>

      {/* Grid Thời khóa biểu dạng Lịch tuần */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3.5 px-3 border-r border-slate-800 text-center w-24 font-bold">
                  Tiết / Giờ
                </th>
                {cacThu.map((thu) => (
                  <th key={thu.ma} className="py-3.5 px-3 border-r border-slate-800 text-center font-bold">
                    {thu.ten}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-400 text-sm">
                    Đang tải thời khóa biểu...
                  </td>
                </tr>
              ) : (
                cacTiet.map((t) => (
                  <tr key={t.tiet} className="hover:bg-slate-50/50 transition-colors">
                    {/* Cột Tiết & Giờ */}
                    <td className="py-2 px-3 border-r border-slate-200 bg-slate-50/80 text-center font-mono">
                      <p className="font-bold text-slate-800">Tiết {t.tiet}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.gio}</p>
                    </td>

                    {/* Cột 7 ngày trong tuần */}
                    {cacThu.map((thu) => {
                      if (biGopTiet(thu.ma, t.tiet)) {
                        return null; // Ô này đã được gộp bởi rowSpan ở tiết trước
                      }

                      const tietHoc = timTietHoc(thu.ma, t.tiet);

                      if (tietHoc) {
                        const mauIndex =
                          (tietHoc.lopHocPhan?.tenLopHocPhan?.length || 0) % mauThe.length;
                        const classMau = mauThe[mauIndex];

                        return (
                          <td
                            key={thu.ma}
                            rowSpan={tietHoc.soTiet}
                            className={`p-2.5 border-r border-slate-200 align-top transition-all ${classMau} border rounded-lg shadow-sm`}
                          >
                            <div className="space-y-1">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-wider block opacity-75">
                                {tietHoc.lopHocPhan?.maLopHocPhan}
                              </span>
                              <h4 className="font-bold text-xs line-clamp-2">
                                {tietHoc.lopHocPhan?.tenLopHocPhan}
                              </h4>
                              <p className="text-[11px] flex items-center gap-1 font-medium opacity-90">
                                <BookOpen className="w-3 h-3 shrink-0" />
                                {tietHoc.lopHocPhan?.monHoc?.tenMonHoc}
                              </p>
                              <div className="pt-1.5 mt-1 border-t border-current/10 flex flex-col gap-0.5 text-[10px] opacity-80">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {tietHoc.phongHoc || 'Phòng LiveKit'}
                                </span>
                                {tietHoc.lopHocPhan?.giaoVien && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3 shrink-0" />
                                    {tietHoc.lopHocPhan.giaoVien.nguoiDung.hoTen}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={thu.ma}
                          className="p-2 border-r border-slate-200 text-center text-slate-300 hover:bg-indigo-50/20"
                        >
                          —
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
