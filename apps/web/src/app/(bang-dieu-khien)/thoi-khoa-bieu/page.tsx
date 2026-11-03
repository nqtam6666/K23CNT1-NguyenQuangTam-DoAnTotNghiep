'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Printer,
  BookOpen,
  MapPin,
  User,
  Filter,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { ThoiKhoaBieu, HocKy } from '@lms/chung';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';

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

  // Bảng màu 8 lớp học phần trong hệ thống thiết kế Soft Academic Studio
  const bangMauLop = [
    'var(--lop-1)',
    'var(--lop-2)',
    'var(--lop-3)',
    'var(--lop-4)',
    'var(--lop-5)',
    'var(--lop-6)',
    'var(--lop-7)',
    'var(--lop-8)',
  ];

  // Tìm tiết học bắt đầu tại tiết và thứ cụ thể
  const timTietHoc = (thu: number, tiet: number) => {
    return danhSachTkb?.find((tkb) => tkb.thuTrongTuan === thu && tkb.tietBatDau === tiet);
  };

  // Kiểm tra xem một tiết có bị gộp bởi tiết trước không
  const biGopTiet = (thu: number, tiet: number) => {
    return danhSachTkb?.some(
      (tkb) =>
        tkb.thuTrongTuan === thu && tkb.tietBatDau < tiet && tkb.tietBatDau + tkb.soTiet > tiet,
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Kế hoạch giảng dạy & học tập</p>
          <h1 className="text-[22px] font-sans font-bold tracking-tight text-[var(--text)]">
            Thời khóa biểu tuần
          </h1>
          <p className="text-[13.5px] text-[var(--muted)] mt-1">
            Lịch học tập và giảng dạy 7 ngày trong tuần được đồng bộ tự động từ phân hệ học vụ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc theo học kỳ */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-[var(--radius)] px-3 py-2 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
            <select
              value={idHocKyLoc}
              onChange={(e) => setIdHocKyLoc(e.target.value)}
              className="bg-transparent text-text text-[12.5px] font-semibold focus:outline-none cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface hover:bg-bg border border-border text-text text-[12.5px] font-semibold rounded-[var(--radius)] transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-muted" />
            <span>In lịch tuần</span>
          </button>
        </div>
      </div>

      {/* Grid Thời khóa biểu dạng Lịch tuần */}
      <div className="bg-surface border border-border rounded-[var(--radius)] overflow-hidden shadow-2xs">
        {/* Chỉ dẫn cuộn ngang trên tablet / mobile */}
        <div className="px-4 py-2 bg-bg border-b border-border flex items-center justify-between text-[11px] text-muted xl:hidden">
          <span className="flex items-center gap-1.5 font-medium">
            <CalendarIcon className="w-3.5 h-3.5 text-accent shrink-0" />
            Lịch học 7 ngày trong tuần
          </span>
          <span className="text-[10px] text-muted">
            Cuộn ngang để xem đầy đủ →
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[840px]">
            <thead>
              <tr className="bg-bg text-muted border-b border-border font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 border-r border-border text-center w-28 font-semibold">
                  Tiết / Giờ
                </th>
                {cacThu.map((thu) => (
                  <th
                    key={thu.ma}
                    className="py-3 px-3 border-r border-border text-center font-semibold"
                  >
                    {thu.ten}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3 border-r border-border bg-bg text-center">
                      <KhungXuong className="h-4 w-12 mx-auto" />
                      <KhungXuong className="h-2.5 w-16 mx-auto mt-1" />
                    </td>
                    {Array.from({ length: 7 }).map((_, c) => (
                      <td key={c} className="p-2 border-r border-border">
                        {(i + c) % 3 === 0 && (
                          <div className="p-2.5 rounded-[var(--radius)] bg-accent-soft border border-accent space-y-1.5">
                            <KhungXuong className="h-3 w-16" />
                            <KhungXuong className="h-3.5 w-24" />
                            <KhungXuong className="h-2.5 w-20" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                cacTiet.map((t) => (
                  <tr key={t.tiet} className="hover:bg-bg/60 transition-colors">
                    {/* Cột Tiết & Giờ */}
                    <td className="py-2.5 px-3 border-r border-border bg-bg text-center font-mono">
                      <p className="font-bold text-text">Tiết {t.tiet}</p>
                      <p className="text-[10.5px] text-muted mt-0.5 tabular-nums">{t.gio}</p>
                    </td>

                    {/* Cột 7 ngày trong tuần */}
                    {cacThu.map((thu) => {
                      if (biGopTiet(thu.ma, t.tiet)) {
                        return null; // Ô này đã được gộp bởi rowSpan ở tiết trước
                      }

                      const tietHoc = timTietHoc(thu.ma, t.tiet);

                      if (tietHoc) {
                        const mauIndex =
                          (tietHoc.lopHocPhan?.maLopHocPhan?.length ||
                            tietHoc.lopHocPhan?.tenLopHocPhan?.length ||
                            0) % bangMauLop.length;
                        const mauLop = bangMauLop[mauIndex];

                        return (
                          <td
                            key={thu.ma}
                            rowSpan={tietHoc.soTiet}
                            className="p-2 border-r border-border align-top"
                          >
                            <div
                              className="h-full p-2.5 rounded-[var(--radius)] border border-[var(--border)] border-l-[3px] bg-[var(--bg)] space-y-1"
                              style={{ borderLeftColor: mauLop }}
                            >
                              <span
                                className="font-mono text-[10.5px] font-bold uppercase tracking-wider block"
                                style={{ color: mauLop }}
                              >
                                {tietHoc.lopHocPhan?.maLopHocPhan}
                              </span>
                              <h4 className="font-bold text-[12.5px] text-[var(--text)] line-clamp-2 leading-snug">
                                {tietHoc.lopHocPhan?.tenLopHocPhan}
                              </h4>
                              <p className="text-[11px] flex items-center gap-1 font-medium text-[var(--muted)]">
                                <BookOpen className="w-3 h-3 shrink-0" />
                                {tietHoc.lopHocPhan?.monHoc?.tenMonHoc}
                              </p>
                              <div className="pt-1.5 mt-1 border-t border-[var(--border)] flex flex-col gap-0.5 text-[11px] text-[var(--muted)]">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {tietHoc.phongHoc || 'Phòng trực tuyến'}
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
                          className="p-2 border-r border-border text-center text-muted"
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
