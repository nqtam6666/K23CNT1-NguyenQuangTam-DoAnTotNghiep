'use client';

import { Activity, Clock, User, Shield } from 'lucide-react';
import { HoatDongGanDay as IHoatDongGanDay } from '@lms/chung';

interface Props {
  danhSach: IHoatDongGanDay[];
}

export function HoatDongGanDayComponent({ danhSach }: Props) {
  if (!danhSach || danhSach.length === 0) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Hoạt động gần đây
        </h3>
        <p className="text-xs text-slate-500 text-center py-8">
          Chưa có nhật ký hoạt động nào được ghi nhận.
        </p>
      </div>
    );
  }

  const dinhDangThoiGian = (chuoiThoiGian: string) => {
    try {
      const d = new Date(chuoiThoiGian);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
    } catch {
      return chuoiThoiGian;
    }
  };

  const dinhDangHanhDong = (hanhDong: string) => {
    const banDo: Record<string, string> = {
      DANG_NHAP_THANH_CONG: 'Đăng nhập thành công',
      DANG_XUAT: 'Đăng xuất',
      NHAP_EXCEL_GHI_DANH: 'Nhập Excel ghi danh',
      TAO_BAI_TAP: 'Tạo bài tập mới',
      CHAM_DIEM: 'Chấm điểm bài nộp',
      DUYET_DON: 'Duyệt đơn xin nghỉ',
      DIEM_DANH: 'Điểm danh buổi học',
    };
    return banDo[hanhDong] || hanhDong.replace(/_/g, ' ');
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Hoạt động gần đây
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Nhật ký kiểm toán hệ thống thời gian thực</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {danhSach.map((item) => (
          <div key={item.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {dinhDangHanhDong(item.hanhDong)}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3" />
                  {item.tenNguoiThucHien}
                </span>
                <span>•</span>
                <span className="truncate">{item.thucThe}</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {dinhDangThoiGian(item.thoiGian)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
