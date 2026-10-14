'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ThuocTinhHopThoai {
  mo: boolean;
  onDong: () => void;
  tieuDe: string;
  eyebrow?: string;
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
 * Thành phần Hộp Thoại (Modal / Dialog) chuẩn Warm Minimal + Monospace
 * - 100% sử dụng React createPortal vào document.body (Quy tắc 07)
 * - Đóng bằng nút (×) góc phải trên, phím Esc và click ra ngoài (có chống đóng nhầm khi kéo bôi đen)
 * - Trap focus bên trong hộp thoại cho điều hướng bàn phím (WCAG AA)
 */
export function HopThoai({
  mo,
  onDong,
  tieuDe,
  eyebrow,
  moTa,
  kichThuoc = 'vua',
  children,
}: ThuocTinhHopThoai) {
  const [daGanVaoDom, setDaGanVaoDom] = useState(false);
  const chuotNhanVaoNenRef = useRef(false);
  const hopThoaiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDaGanVaoDom(true);
  }, []);

  // Bắt phím Escape, Trap Focus và khóa cuộn chuột
  useEffect(() => {
    if (!mo) return;

    const phanTuTruocDo = document.activeElement as HTMLElement | null;

    const xuLyNhanPhim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onDong();
        return;
      }

      if (e.key === 'Tab' && hopThoaiRef.current) {
        const cacPhanTuFocusable = hopThoaiRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (cacPhanTuFocusable.length === 0) return;

        const dauTien = cacPhanTuFocusable[0];
        const cuoiCung = cacPhanTuFocusable[cacPhanTuFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === dauTien || !hopThoaiRef.current.contains(document.activeElement)) {
            e.preventDefault();
            cuoiCung.focus();
          }
        } else {
          if (document.activeElement === cuoiCung || !hopThoaiRef.current.contains(document.activeElement)) {
            e.preventDefault();
            dauTien.focus();
          }
        }
      }
    };

    const overflowGoc = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', xuLyNhanPhim);

    // Tự động đưa focus vào phần tử nhập liệu đầu tiên hoặc nút đóng
    const timer = setTimeout(() => {
      if (hopThoaiRef.current && !hopThoaiRef.current.contains(document.activeElement)) {
        const oNhapDau = hopThoaiRef.current.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])',
        );
        oNhapDau?.focus();
      }
    }, 30);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = overflowGoc;
      window.removeEventListener('keydown', xuLyNhanPhim);
      if (phanTuTruocDo && typeof phanTuTruocDo.focus === 'function') {
        phanTuTruocDo.focus();
      }
    };
  }, [mo, onDong]);

  if (!daGanVaoDom || !mo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tieuDe}
      onMouseDown={(e) => {
        chuotNhanVaoNenRef.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        const laClickHopLe =
          e.target === e.currentTarget && (chuotNhanVaoNenRef.current || e.detail === 0);

        if (laClickHopLe) {
          onDong();
        }
        chuotNhanVaoNenRef.current = false;
      }}
      className="fixed inset-0 z-[99999] bg-black/55 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        ref={hopThoaiRef}
        className={`relative w-full ${banDoKichThuoc[kichThuoc]} bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] border border-[var(--border)] my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150`}
      >
        {/* Header hộp thoại */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--border)] shrink-0">
          <div className="space-y-0.5 min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h3 className="font-mono text-[16px] sm:text-[17px] font-bold text-[var(--text)] tracking-tight">
              {tieuDe}
            </h3>
            {moTa && <p className="text-xs text-[var(--muted)] leading-relaxed">{moTa}</p>}
          </div>

          <button
            type="button"
            onClick={onDong}
            aria-label="Đóng hộp thoại"
            className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)] rounded-[var(--radius)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-[18px] h-[18px] stroke-[1.5]" />
          </button>
        </div>

        {/* Nội dung bên trong hộp thoại */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
