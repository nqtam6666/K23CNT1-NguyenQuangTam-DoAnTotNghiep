import type { Metadata } from 'next';
import './globals.css';
import { BoCungCapTruyVan } from '../cung-cap/bo-cung-cap-truy-van';

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
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        <BoCungCapTruyVan>{children}</BoCungCapTruyVan>
      </body>
    </html>
  );
}
