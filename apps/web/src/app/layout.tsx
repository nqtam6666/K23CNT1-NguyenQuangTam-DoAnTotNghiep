import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { BoCungCapTruyVan } from '../cung-cap/bo-cung-cap-truy-van';
import { BoCungCapGiaoDien } from '../cung-cap/bo-cung-cap-giao-dien';
import { ThanhTienTrinhChuyenTrang } from '../thanh-phan/thanh-tien-trinh-chuyen-trang';
import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'SmartClass AI - Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
  description:
    'Hệ thống lớp học số tích hợp trí tuệ nhân tạo SmartClass AI: Điểm danh thông minh, luyện tập, thi thử và quản lý kết quả học phần (K23CNT1 - Nguyễn Quang Tâm)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn('font-sans', beVietnamPro.variable, jetbrainsMono.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('lms_theme');
                var isDark = theme === 'toi' || theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
                var savedFavicon = localStorage.getItem('lms_favicon');
                if (savedFavicon) {
                  var link = document.querySelector("link[rel='icon']") || document.createElement('link');
                  link.setAttribute('rel', 'icon');
                  link.setAttribute('href', savedFavicon);
                  if (!link.parentNode) document.head.appendChild(link);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-bg text-text overflow-x-hidden">
        <BoCungCapGiaoDien>
          <ThanhTienTrinhChuyenTrang />
          <BoCungCapTruyVan>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="top-right" richColors closeButton expand={false} />
          </BoCungCapTruyVan>
        </BoCungCapGiaoDien>
      </body>
    </html>
  );
}
