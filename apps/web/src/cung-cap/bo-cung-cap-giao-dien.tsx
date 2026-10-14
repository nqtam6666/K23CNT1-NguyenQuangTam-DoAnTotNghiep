'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

function DongBoGiaoDienLms() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    try {
      const themeNext = localStorage.getItem('theme');
      const themeCu = localStorage.getItem('lms_theme');
      if (!themeNext && themeCu) {
        setTheme(themeCu === 'toi' || themeCu === 'dark' ? 'dark' : 'light');
      }
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
  }, [setTheme]);

  React.useEffect(() => {
    if (!resolvedTheme) return;
    try {
      const isDark = resolvedTheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('lms_theme', isDark ? 'toi' : 'sang');
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
  }, [resolvedTheme]);

  return null;
}

export function BoCungCapGiaoDien({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <DongBoGiaoDienLms />
      {children}
    </NextThemesProvider>
  );
}
