'use client';

import { useMemo } from 'react';
import { Calendar, Terminal } from 'lucide-react';
import { layNhanVaiTro, VaiTro } from '@lms/chung';
import { useCaiDatHeThong } from '../../tien-ich/use-cai-dat';
import { HuyHieu } from '../huy-hieu';

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
    <section className="rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-[44px] h-[44px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
            <Terminal strokeWidth={1.5} className="w-[20px] h-[20px]" />
          </div>

          <div className="space-y-1 min-w-0">
            <p className="eyebrow">TỔNG QUAN HỆ THỐNG</p>
            <h1 className="font-mono text-[20px] sm:text-[22px] font-bold text-[var(--text)] tracking-tight truncate">
              {loiChao}, {hoTen || 'Thành viên'}
            </h1>
            <p className="text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
              Không gian làm việc {tenHeThong}. Phân quyền hiện tại:{' '}
              <HuyHieu loai="accent" className="ml-1">
                {layNhanVaiTro(vaiTro as VaiTro) || 'Người dùng'}
              </HuyHieu>
            </p>
          </div>
        </div>

        {/* Thông tin thời gian và học kỳ */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
            <Calendar strokeWidth={1.5} className="w-[18px] h-[18px] text-[var(--accent)] shrink-0" />
            <div className="text-left">
              <p className="font-mono text-xs font-semibold capitalize text-[var(--text)]">
                {ngayHienTai}
              </p>
              <p className="font-mono text-[11px] text-[var(--muted)]">Học kỳ 1 · 2025-2026</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
