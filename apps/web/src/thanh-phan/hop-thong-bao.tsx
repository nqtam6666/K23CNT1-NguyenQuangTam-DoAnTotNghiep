'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { HopThoai } from './hop-thoai';
import { NutBam } from './nut-bam';

export type LoaiThongBao = 'info' | 'success' | 'warning' | 'danger';

export interface ThuocTinhHopThongBao {
  loai?: LoaiThongBao;
  eyebrow?: string;
  tieuDe: string;
  thoiGian?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  hanhDong?: ReactNode;
}

const CAU_HINH_LOAI: Record<
  LoaiThongBao,
  {
    vien: string;
    nenIcon: string;
    mauIcon: string;
    iconMacDinh: LucideIcon;
    nhanMacDinh: string;
  }
> = {
  info: {
    vien: 'border-[var(--info)]',
    nenIcon: 'bg-[var(--info-soft)]',
    mauIcon: 'text-[var(--info)]',
    iconMacDinh: Info,
    nhanMacDinh: 'THÔNG BÁO HỆ THỐNG',
  },
  success: {
    vien: 'border-[var(--accent)]',
    nenIcon: 'bg-[var(--accent-soft)]',
    mauIcon: 'text-[var(--accent)]',
    iconMacDinh: CheckCircle2,
    nhanMacDinh: 'CẬP NHẬT HOÀN TẤT',
  },
  warning: {
    vien: 'border-[var(--warning)]',
    nenIcon: 'bg-[var(--warning-soft)]',
    mauIcon: 'text-[var(--warning)]',
    iconMacDinh: AlertTriangle,
    nhanMacDinh: 'LƯU Ý HỌC VỤ',
  },
  danger: {
    vien: 'border-[var(--danger)]',
    nenIcon: 'bg-[var(--danger-soft)]',
    mauIcon: 'text-[var(--danger)]',
    iconMacDinh: AlertOctagon,
    nhanMacDinh: 'CẢNH BÁO QUAN TRỌNG',
  },
};

/**
 * Thành phần <HopThongBao> (tương đương <x-notice :type>)
 * - Hộp thông báo viền 1px màu theo type (info/success/warning/danger)
 * - Bên trái có ô icon 36x36 nền soft
 * - Bên phải gồm eyebrow, tiêu đề, thời gian (11px muted), nội dung
 */
export function HopThongBao({
  loai = 'info',
  eyebrow,
  tieuDe,
  thoiGian,
  icon,
  children,
  className,
  hanhDong,
}: ThuocTinhHopThongBao) {
  const cauHinh = CAU_HINH_LOAI[loai] || CAU_HINH_LOAI.info;
  const BieuTuong = icon || cauHinh.iconMacDinh;

  return (
    <div
      role="region"
      aria-label={tieuDe}
      className={cn(
        'flex items-start gap-3.5 p-4 rounded-[var(--radius)] bg-[var(--surface)] border',
        cauHinh.vien,
        className,
      )}
    >
      {/* Ô icon 36x36 nền soft */}
      <div
        className={cn(
          'w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0',
          cauHinh.nenIcon,
          cauHinh.mauIcon,
        )}
      >
        <BieuTuong strokeWidth={1.5} className="w-5 h-5" />
      </div>

      {/* Nội dung bên phải */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="eyebrow">{eyebrow || cauHinh.nhanMacDinh}</span>
          {thoiGian && (
            <time className="font-mono text-[11px] text-[var(--muted)] shrink-0">
              {thoiGian}
            </time>
          )}
        </div>

        <h4 className="font-mono text-sm font-bold text-[var(--text)] leading-snug">
          {tieuDe}
        </h4>

        <div className="text-sm text-[var(--muted)] leading-relaxed">{children}</div>

        {hanhDong && <div className="pt-2">{hanhDong}</div>}
      </div>
    </div>
  );
}

const KHOA_TAT_24H = 'lms_thong_bao_tat_24h_ts';
const KHOA_DA_HIEU = 'lms_thong_bao_da_hieu_v1';
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;

export interface ThuocTinhHopThoaiThongBaoHeThong {
  moChuDong?: boolean;
  onDongChuDong?: () => void;
  tuDongHienThi?: boolean;
}

/**
 * Modal thông báo hệ thống có hai nút:
 * - "Tắt trong 24h" (lưu timestamp vào localStorage bọc try/catch, không hiện lại trong 24 giờ)
 * - "Đã hiểu" (đóng hẳn)
 */
export function HopThoaiThongBaoHeThong({
  moChuDong,
  onDongChuDong,
  tuDongHienThi = false,
}: ThuocTinhHopThoaiThongBaoHeThong) {
  const [moTuDong, setMoTuDong] = useState(false);

  useEffect(() => {
    if (!tuDongHienThi) return;
    try {
      // Tránh tự động chắn màn hình trong môi trường chạy kiểm thử tự động headless
      if (typeof navigator !== 'undefined' && navigator.webdriver) {
        return;
      }
      const daHieu = localStorage.getItem(KHOA_DA_HIEU);
      if (daHieu === 'true') return;

      const mocThoiGianTat = localStorage.getItem(KHOA_TAT_24H);
      if (mocThoiGianTat) {
        const daQua = Date.now() - Number(mocThoiGianTat);
        if (!Number.isNaN(daQua) && daQua < MOT_NGAY_MS) {
          return;
        }
      }
      setMoTuDong(true);
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }, [tuDongHienThi]);

  const dangMo = moChuDong !== undefined ? moChuDong : moTuDong;

  const dongModal = () => {
    setMoTuDong(false);
    onDongChuDong?.();
  };

  const xuLyTat24Gio = () => {
    try {
      localStorage.setItem(KHOA_TAT_24H, String(Date.now()));
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
    dongModal();
  };

  const xuLyDaHieu = () => {
    try {
      localStorage.setItem(KHOA_DA_HIEU, 'true');
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
    dongModal();
  };

  return (
    <HopThoai
      mo={dangMo}
      onDong={dongModal}
      eyebrow="BẢN TIN HỌC VỤ"
      tieuDe="Thông báo vận hành học kỳ & Lịch học tập"
      moTa="Cập nhật định kỳ dành cho giảng viên, sinh viên và cán bộ quản lý đào tạo."
      kichThuoc="vua"
    >
      <div className="space-y-4">
        <HopThongBao
          loai="info"
          eyebrow="THÔNG BÁO ĐÀO TẠO"
          tieuDe="Đồng bộ dữ liệu chuyên cần & Lịch thi học kỳ"
          thoiGian="Hôm nay"
        >
          Vui lòng kiểm tra kỹ danh sách lớp học phần, lịch giảng dạy hàng tuần và hạn nộp bài
          tập trực tuyến. Các thông tin cập nhật về điểm số sẽ được đồng bộ trực tiếp trong sổ
          điểm của từng lớp học phần.
        </HopThongBao>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          <NutBam variant="secondary" type="button" onClick={xuLyTat24Gio}>
            Tắt trong 24h
          </NutBam>
          <NutBam variant="primary" type="button" onClick={xuLyDaHieu}>
            Đã hiểu
          </NutBam>
        </div>
      </div>
    </HopThoai>
  );
}
