'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ThanhTienTrinhNoiDung() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dangTai, setDangTai] = useState(false);
  const [tienTrinh, setTienTrinh] = useState(0);

  // Khi đường dẫn hoặc tham số URL thay đổi -> hoàn tất tiến trình
  useEffect(() => {
    if (dangTai) {
      setTienTrinh(100);
      const timerKetThuc = setTimeout(() => {
        setDangTai(false);
        setTienTrinh(0);
      }, 250);
      return () => clearTimeout(timerKetThuc);
    }
  }, [pathname, searchParams]);

  // Lắng nghe click vào thẻ <a> và lịch sử duyệt web
  useEffect(() => {
    let timerDem: NodeJS.Timeout;

    const batDauChayTienTrinh = () => {
      if (
        typeof document !== 'undefined' &&
        document.documentElement.getAttribute('data-top-progress') === 'false'
      ) {
        return;
      }
      setDangTai(true);
      setTienTrinh(15);
      clearInterval(timerDem);

      timerDem = setInterval(() => {
        setTienTrinh((truoc) => {
          if (truoc >= 85) {
            clearInterval(timerDem);
            return truoc;
          }
          const delta = Math.max(1, (85 - truoc) * 0.15);
          return truoc + delta;
        });
      }, 120);
    };

    const xuLyClick = (e: MouseEvent) => {
      const theA = (e.target as HTMLElement).closest('a');
      if (!theA) return;

      const href = theA.getAttribute('href');
      if (!href) return;

      if (
        theA.target === '_blank' ||
        theA.hasAttribute('download') ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      const duongDanDich = href.split('?')[0];
      const duongDanHienTai = window.location.pathname;
      if (duongDanDich === duongDanHienTai && !href.includes('?')) {
        return;
      }

      batDauChayTienTrinh();
    };

    const xuLyPopState = () => {
      batDauChayTienTrinh();
    };

    const xuLySuKienTuyBien = () => {
      batDauChayTienTrinh();
    };

    document.addEventListener('click', xuLyClick, { capture: true });
    window.addEventListener('popstate', xuLyPopState);
    window.addEventListener('lms:bat-dau-chuyen-trang', xuLySuKienTuyBien);

    return () => {
      document.removeEventListener('click', xuLyClick, { capture: true });
      window.removeEventListener('popstate', xuLyPopState);
      window.removeEventListener('lms:bat-dau-chuyen-trang', xuLySuKienTuyBien);
      clearInterval(timerDem);
    };
  }, []);

  if (!dangTai && tienTrinh === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: dangTai ? 1 : 0 }}
    >
      <div
        className="h-[2px] bg-[var(--accent)] transition-all duration-150 ease-out"
        style={{ width: `${tienTrinh}%` }}
      />
    </div>
  );
}

export function ThanhTienTrinhChuyenTrang() {
  return (
    <Suspense fallback={null}>
      <ThanhTienTrinhNoiDung />
    </Suspense>
  );
}

export function kichHoatTienTrinhChuyenTrang() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lms:bat-dau-chuyen-trang'));
  }
}
