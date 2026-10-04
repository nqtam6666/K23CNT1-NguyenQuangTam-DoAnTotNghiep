'use client';

import { useMemo } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { layNhanVaiTro, VaiTro } from '@lms/chung';
import { useCaiDatHeThong } from '../../tien-ich/use-cai-dat';

interface Props {
  hoTen?: string;
  vaiTro?: string;
}

export function BannerChao({ hoTen, vaiTro }: Props) {
  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'Hệ thống Quản lý Học tập');

  const { loiChao, ngayHienTai } = useMemo(() => {
    const gio = new Date().getHours();
    let chao = 'Xin chào';
    if (gio >= 5 && gio < 12) {
      chao = 'Chào buổi sáng';
    } else if (gio >= 12 && gio < 18) {
      chao = 'Chào buổi chiều';
    } else {
      chao = 'Chào buổi tối';
    }

    const ngay = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return { loiChao: chao, ngayHienTai: ngay };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-7 shadow-xs">
      {/* Nền hiệu ứng đồ họa tinh tế */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight">
              {loiChao}, {hoTen || 'Thành viên'} 👋
            </span>
          </div>

          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Chào mừng bạn đến với {tenHeThong}. Bạn đang truy cập với vai trò{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/15 text-white font-medium text-xs backdrop-blur-xs">
              {layNhanVaiTro(vaiTro as VaiTro) || 'Người dùng'}
            </span>
            .
          </p>
        </div>

        {/* Thông tin thời gian và học kỳ */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto pt-2 sm:pt-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs text-xs text-blue-50">
            <Calendar className="w-4 h-4 text-blue-200" />
            <div className="text-right sm:text-left">
              <p className="font-semibold capitalize text-white">{ngayHienTai}</p>
              <p className="text-[11px] text-blue-200">Học kỳ 1 (2025-2026)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
