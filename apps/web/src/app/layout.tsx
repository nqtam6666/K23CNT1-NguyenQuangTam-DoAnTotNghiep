import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { BoCungCapTruyVan } from '../cung-cap/bo-cung-cap-truy-van';
import { ThanhTienTrinhChuyenTrang } from '../thanh-phan/thanh-tien-trinh-chuyen-trang';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Hệ thống Quản lý Học tập LMS Trường học',
  description:
    'Nền tảng LMS tích hợp Lớp học trực tuyến LiveKit và Trợ lý Học tập AI (K23CNT1 - Nguyễn Quang Tâm)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('lms_theme');
                if (theme === 'toi' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <ThanhTienTrinhChuyenTrang />
        <BoCungCapTruyVan>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" richColors closeButton expand={false} />
        </BoCungCapTruyVan>
      </body>
    </html>
  );
}
