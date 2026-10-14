'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

interface ThuocTinhNutChuyenGiaoDien {
  isDark?: boolean;
  onToggle?: () => void;
  className?: string;
  hienThiNhan?: boolean;
  title?: string;
  'aria-label'?: string;
}

/**
 * Thành phần <x-theme-toggle> (Chế độ Sáng / Tối)
 * - Lưu lựa chọn vào localStorage bọc try/catch
 * - Mặc định theo hệ thống (prefers-color-scheme: dark)
 * - Hỗ trợ cả tự quản lý state hoặc truyền qua props từ Layout
 */
export const ThemeToggleButton2 = ({
  isDark: isDarkProp,
  onToggle,
  className = '',
  hienThiNhan = false,
  title,
  'aria-label': ariaLabel = 'Chuyển đổi giao diện sáng tối',
}: ThuocTinhNutChuyenGiaoDien) => {
  const [internalDark, setInternalDark] = useState(false);

  useEffect(() => {
    if (isDarkProp !== undefined) return;
    try {
      const luuTru = localStorage.getItem('lms_theme');
      const heThongToi = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const laToi = luuTru === 'toi' || luuTru === 'dark' || (!luuTru && heThongToi);
      setInternalDark(laToi);
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
  }, [isDarkProp]);

  const isDark = isDarkProp !== undefined ? isDarkProp : internalDark;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    const tiepTheo = !internalDark;
    setInternalDark(tiepTheo);
    if (tiepTheo) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('lms_theme', tiepTheo ? 'toi' : 'sang');
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
  };

  return (
    <button
      type="button"
      data-testid="nut-che-do-sang-toi"
      title={title || (isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối')}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] text-[var(--muted)] hover:text-[var(--text)] font-mono text-xs transition-colors cursor-pointer',
        className,
      )}
    >
      {isDark ? (
        <Moon className="w-[18px] h-[18px] stroke-[1.5] text-[var(--accent)] shrink-0" />
      ) : (
        <Sun className="w-[18px] h-[18px] stroke-[1.5] text-[var(--accent)] shrink-0" />
      )}
      {hienThiNhan && <span>{isDark ? 'Tối' : 'Sáng'}</span>}
    </button>
  );
};

export const NutChuyenGiaoDien = ThemeToggleButton2;

export {
  AnimatedThemeToggler,
  AnimatedThemeTogglerDemo,
} from '@/registry/magicui/animated-theme-toggler';

export { ToggleTheme } from '@/components/ui/toggle-theme';
