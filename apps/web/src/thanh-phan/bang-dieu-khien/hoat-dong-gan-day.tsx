'use client';

import { Activity, Clock, User, Shield } from 'lucide-react';
import { HoatDongGanDay as IHoatDongGanDay } from '@lms/chung';
import { TheKhung } from '../the-khung';
import { TrangThaiRong } from '../bang-du-lieu';

interface Props {
  danhSach: IHoatDongGanDay[];
}

export function HoatDongGanDayComponent({ danhSach }: Props) {
  const dinhDangThoiGian = (chuoiThoiGian: string) => {
    try {
      const d = new Date(chuoiThoiGian);
      return (
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        d.toLocaleDateString('vi-VN')
      );
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
    <TheKhung
      icon={Activity}
      eyebrow="NHẬT KÝ VẬN HÀNH"
      tieuDe="Hoạt động gần đây"
      moTa="Nhật ký kiểm toán hệ thống thời gian thực"
    >
      {!danhSach || danhSach.length === 0 ? (
        <TrangThaiRong
          icon={Activity}
          moTa="Chưa có nhật ký hoạt động nào được ghi nhận."
          className="border-none py-6"
        />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {danhSach.map((item) => (
            <div key={item.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Shield strokeWidth={1.5} className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-semibold text-[var(--text)] truncate">
                  {dinhDangHanhDong(item.hanhDong)}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted)]">
                  <span className="flex items-center gap-1 truncate">
                    <User strokeWidth={1.5} className="w-3 h-3" />
                    {item.tenNguoiThucHien}
                  </span>
                  <span>·</span>
                  <span className="font-mono truncate">{item.thucThe}</span>
                </div>
              </div>

              <span className="font-mono text-[11px] text-[var(--muted)] shrink-0 flex items-center gap-1">
                <Clock strokeWidth={1.5} className="w-3 h-3" />
                {dinhDangThoiGian(item.thoiGian)}
              </span>
            </div>
          ))}
        </div>
      )}
    </TheKhung>
  );
}
