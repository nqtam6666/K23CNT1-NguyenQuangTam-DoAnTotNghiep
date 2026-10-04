'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thanh tiến trình tải trang (Top Loading Progress Bar)
 * Tự động kích hoạt khi người dùng nhấp vào bất kỳ liên kết nội bộ nào,
 * cung cấp phản hồi thị giác ngay lập tức để người dùng không cảm thấy bị đơ hoặc trễ.
 */
export function ThanhTienTrinhChuyenTrang() {
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
      setDangTai(true);
      setTienTrinh(15);
      clearInterval(timerDem);

      timerDem = setInterval(() => {
        setTienTrinh((truoc) => {
          if (truoc >= 85) {
            clearInterval(timerDem);
            return truoc;
          }
          // Chạy nhanh lúc đầu, chậm dần về 85%
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

      // Bỏ qua link mở tab mới, file tải về, link bên ngoài, hashtag hoặc mailto
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

      // Kiểm tra nếu click vào chính trang hiện tại
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
      {/* Vạch tiến trình Gradient */}
      <div
        className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(59,130,246,0.8)]"
        style={{ width: `${tienTrinh}%` }}
      />
      {/* Vệt sáng phát sáng ở đầu vạch */}
      <div
        className="absolute top-0 h-[3px] w-20 bg-white/70 blur-[1px] transform -translate-x-full transition-all duration-150"
        style={{ left: `${tienTrinh}%` }}
      />
    </div>
  );
}

/**
 * Hàm tiện ích kích hoạt thanh tiến trình khi chuyển trang bằng router.push
 */
export function kichHoatTienTrinhChuyenTrang() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lms:bat-dau-chuyen-trang'));
  }
}
