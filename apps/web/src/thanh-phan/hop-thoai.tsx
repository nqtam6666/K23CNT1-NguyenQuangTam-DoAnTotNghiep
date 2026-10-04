'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ThuocTinhHopThoai {
  mo: boolean;
  onDong: () => void;
  tieuDe: string;
  moTa?: string;
  kichThuoc?: 'nho' | 'vua' | 'lon' | 'rat-lon';
  children: ReactNode;
}

const banDoKichThuoc = {
  nho: 'max-w-md',
  vua: 'max-w-lg',
  lon: 'max-w-2xl',
  'rat-lon': 'max-w-4xl',
};

/**
 * Thành phần Hộp Thoại (Modal / Dialog) chuẩn mực của Hệ thống LMS
 * - 100% sử dụng React createPortal vào document.body để luôn phủ toàn màn hình (Full viewport)
 * - Miễn nhiễm với mọi thuộc tính transform, overflow-hidden hoặc stacking context của container cha
 * - Tự động khóa cuộn trang, bắt phím Escape và click ngoài nền để đóng
 */
export function HopThoai({
  mo,
  onDong,
  tieuDe,
  moTa,
  kichThuoc = 'vua',
  children,
}: ThuocTinhHopThoai) {
  const [daGanVaoDom, setDaGanVaoDom] = useState(false);

  useEffect(() => {
    setDaGanVaoDom(true);
  }, []);

  // Bắt phím Escape và khóa cuộn chuột
  useEffect(() => {
    if (!mo) return;

    const xuLyNhanPhim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDong();
      }
    };

    const overflowGoc = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', xuLyNhanPhim);

    return () => {
      document.body.style.overflow = overflowGoc;
      window.removeEventListener('keydown', xuLyNhanPhim);
    };
  }, [mo, onDong]);

  if (!daGanVaoDom || !mo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Chỉ đóng khi click trực tiếp vào lớp nền tối bên ngoài
        if (e.target === e.currentTarget) {
          onDong();
        }
      }}
      className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className={`relative w-full ${banDoKichThuoc[kichThuoc]} bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150`}
      >
        {/* Nút đóng góc trên bên phải */}
        <button
          type="button"
          onClick={onDong}
          aria-label="Đóng hộp thoại"
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & mô tả */}
        <div className="pr-8 space-y-1 shrink-0">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{tieuDe}</h3>
          {moTa && <p className="text-xs text-slate-500 leading-relaxed">{moTa}</p>}
        </div>

        {/* Nội dung bên trong hộp thoại */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
