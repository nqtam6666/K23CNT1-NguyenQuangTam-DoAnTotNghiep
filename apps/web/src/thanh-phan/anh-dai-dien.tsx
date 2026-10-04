'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface ThuocTinhAnhDaiDien {
  url?: string | null;
  hoTen?: string | null;
  kichThuoc?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  chuCaiFallback?: string;
  hienThiVien?: boolean;
}

const banDoKichThuoc = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg font-bold',
  xl: 'w-20 h-20 text-2xl font-bold',
  '2xl': 'w-28 h-28 text-3xl font-bold',
};

// Bảng màu gradient sư phạm nền nã, hiện đại dựa trên tên
const bangMauInitials = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-teal-600 text-white',
  'bg-emerald-600 text-white',
  'bg-sky-600 text-white',
  'bg-violet-600 text-white',
  'bg-cyan-600 text-white',
  'bg-amber-600 text-white',
];

function tinhMauTheoTen(ten: string): string {
  let tong = 0;
  for (let i = 0; i < ten.length; i++) {
    tong += ten.charCodeAt(i);
  }
  return bangMauInitials[tong % bangMauInitials.length];
}

/**
 * Thành phần hiển thị ảnh đại diện thống nhất trong toàn hệ thống LMS
 * - Tự động tải ảnh đại diện từ đường dẫn máy chủ hoặc liên kết ngoài
 * - Tự động dự phòng về chữ cái đầu tiên (Initials) nếu không có ảnh hoặc ảnh bị lỗi
 * - Tương thích hoàn toàn với Chế độ sáng / Chế độ tối
 */
export function AnhDaiDien({
  url,
  hoTen,
  kichThuoc = 'md',
  className = '',
  chuCaiFallback,
  hienThiVien = false,
}: ThuocTinhAnhDaiDien) {
  const [loiAnh, setLoiAnh] = useState(false);

  // Reset trạng thái lỗi khi đường dẫn url thay đổi
  useEffect(() => {
    setLoiAnh(false);
  }, [url]);

  const tenHienThi = hoTen?.trim() || '';
  const chuCai =
    chuCaiFallback ||
    (tenHienThi
      ? tenHienThi.split(' ').filter(Boolean).pop()?.charAt(0).toUpperCase() ||
        tenHienThi.charAt(0).toUpperCase()
      : 'U');

  const lopKichThuoc = banDoKichThuoc[kichThuoc] || banDoKichThuoc.md;
  const mauNen = tinhMauTheoTen(tenHienThi || 'LMS');
  const lopVien = hienThiVien ? 'ring-2 ring-white dark:ring-slate-800 shadow-2xs' : '';

  // Xử lý chuẩn hóa URL ảnh nếu bắt đầu bằng /uploads
  const urlChuanHoa = url?.trim() || null;

  if (urlChuanHoa && !loiAnh) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none bg-slate-100 dark:bg-slate-800 ${lopKichThuoc} ${lopVien} ${className}`}
      >
        <img
          src={urlChuanHoa}
          alt={tenHienThi ? `Ảnh đại diện của ${tenHienThi}` : 'Ảnh đại diện người dùng'}
          onError={() => setLoiAnh(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      title={tenHienThi || 'Người dùng'}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none font-semibold shadow-2xs ${lopKichThuoc} ${mauNen} ${lopVien} ${className}`}
    >
      {chuCai ? (
        <span>{chuCai}</span>
      ) : (
        <User className="w-1/2 h-1/2 opacity-90" />
      )}
    </div>
  );
}
