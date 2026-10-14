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

export function AnhDaiDien({
  url,
  hoTen,
  kichThuoc = 'md',
  className = '',
  chuCaiFallback,
  hienThiVien = false,
}: ThuocTinhAnhDaiDien) {
  const [loiAnh, setLoiAnh] = useState(false);

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
  const lopVien = hienThiVien ? 'border border-border' : '';

  const urlChuanHoa = url?.trim() || null;

  if (urlChuanHoa && !loiAnh) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden select-none bg-surface ${lopKichThuoc} ${lopVien} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none font-mono font-semibold bg-accent-soft text-accent border border-border ${lopKichThuoc} ${lopVien} ${className}`}
    >
      {chuCai ? (
        <span>{chuCai}</span>
      ) : (
        <User strokeWidth={1.5} className="w-1/2 h-1/2" />
      )}
    </div>
  );
}
