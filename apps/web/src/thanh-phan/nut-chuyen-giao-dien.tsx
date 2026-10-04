'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface ThuocTinhNutChuyenGiaoDien {
  isDark?: boolean;
  onToggle?: () => void;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

/**
 * Nút chuyển đổi Chế độ Sáng / Tối (ThemeToggleButton2)
 * Sử dụng Framer Motion biến đổi mượt mà giữa Mặt trời (các tia sáng xoay & thu nhỏ)
 * và Mặt trăng lưỡi liềm (dùng clipPath SVG dịch chuyển tạo vết khuyết).
 */
export const ThemeToggleButton2 = ({
  isDark: isDarkProp,
  onToggle,
  className = '',
  title,
  'aria-label': ariaLabel = 'Chuyển đổi giao diện sáng tối',
}: ThuocTinhNutChuyenGiaoDien) => {
  const [internalDark, setInternalDark] = useState(false);
  const isDark = isDarkProp !== undefined ? isDarkProp : internalDark;

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalDark(!internalDark);
    }
  };

  return (
    <button
      type="button"
      data-testid="nut-che-do-sang-toi"
      title={
        title ||
        (isDark ? 'Chuyển sang Chế độ sáng' : 'Chuyển sang Chế độ tối')
      }
      aria-label={ariaLabel}
      className={cn(
        'group relative flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all duration-300 active:scale-90 cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
      onClick={handleClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-4 h-4 transition-colors group-hover:text-indigo-600 dark:group-hover:text-amber-400"
      >
        <clipPath id="skiper-btn-2">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#skiper-btn-2)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: 'easeInOut', duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
};

export const NutChuyenGiaoDien = ThemeToggleButton2;
