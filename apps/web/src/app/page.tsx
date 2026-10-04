'use client';

import Link from 'next/link';
import {
  BookOpen,
  Video,
  Bot,
  ArrowRight,
  Sparkles,
  Mail,
  Phone,
  School,
  BellRing,
} from 'lucide-react';
import { useCaiDatHeThong } from '../tien-ich/use-cai-dat';

export default function TrangChu() {
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();

  const tenHeThong = layGiaTri('TEN_HE_THONG', 'LMS Trường Học');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Quản lý Học tập Thế hệ Mới');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Công nghệ');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLopKhoa = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');
  const emailLienHe = layGiaTri('EMAIL_LIEN_HE', 'nguyenquangtam179@gmail.com');
  const soDienThoai = layGiaTri('SO_DIEN_THOAI', '0987654321');
  const bannerTieuDe = layGiaTri(
    'BANNER_TIEU_DE',
    'Nền tảng Học tập Toàn diện Tích hợp Phòng học LiveKit & Trợ lý AI',
  );
  const bannerMoTa = layGiaTri(
    'BANNER_MO_TA',
    'Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin. Tối ưu hóa trải nghiệm giảng dạy trực tuyến, quản lý học vụ và hỗ trợ học tập thông minh.',
  );
  const thongBaoChung = layGiaTri('THONG_BAO_CHUNG');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* Banner thông báo chung của hệ thống từ Cài đặt nếu có */}
      {thongBaoChung && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 shadow-inner">
          <BellRing className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span>{thongBaoChung}</span>
        </div>
      )}

      {/* Header Điều hướng */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">{tenHeThong}</span>
              {maLopKhoa && (
                <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                  {maLopKhoa}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dang-nhap"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            {choPhepDangKy && (
              <Link
                href="/dang-ky"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Bắt đầu ngay
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          {khauHieu && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {khauHieu}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {bannerTieuDe}
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {bannerMoTa}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dang-nhap"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white bg-blue-600 font-medium hover:bg-blue-700 transition-all shadow-md"
            >
              Truy cập Hệ thống <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="http://localhost:4000/api/tai-lieu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-slate-700 bg-white border border-slate-200 font-medium hover:bg-slate-50 transition-all shadow-sm"
            >
              Tài liệu API Swagger
            </a>
          </div>
        </section>

        {/* Tính năng cốt lõi */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-900">Tính năng Trọng tâm</h2>
              <p className="text-slate-600 mt-2 text-sm">
                Ba trụ cột công nghệ chính được tích hợp liền mạch
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Thẻ 1: Quản lý học vụ */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Quản lý Học vụ Chuẩn mực</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Quản lý lớp học phần, thời khóa biểu, giao bài tập, nộp bài, chấm điểm với tiêu
                  chí rõ ràng và sổ điểm tự động.
                </p>
              </div>

              {/* Thẻ 2: LiveKit SFU */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Lớp học Trực tuyến LiveKit</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Phòng học ảo độ trễ thấp, chia sẻ màn hình, bảng trắng tương tác, tự động điểm
                  danh theo thời gian thực.
                </p>
              </div>

              {/* Thẻ 3: RAG AI */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Trợ lý AI Thông minh (RAG)</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Hỏi đáp ngữ nghĩa dựa trên giáo trình bài giảng, hỗ trợ sinh đề thi, trích dẫn
                  chính xác nguồn tài liệu lớp học.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Thông tin liên hệ & Đơn vị đào tạo */}
        <section className="py-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <School className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">Đơn vị đào tạo</p>
                  <p className="text-sm font-semibold text-slate-800">{tenTruong}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">Hòm thư hỗ trợ</p>
                  <a
                    href={`mailto:${emailLienHe}`}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {emailLienHe}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-medium">Đường dây nóng</p>
                  <p className="text-sm font-semibold text-slate-800">{soDienThoai}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">
          Đồ án Tốt nghiệp {tenHeThong} - {maLopKhoa} {tacGia} - MSSV: {mssv}
        </p>
        <p className="mt-1">
          Hệ thống Quản lý Học tập Thế hệ mới trên nền tảng NestJS 10, Next.js 15, PostgreSQL 16 &
          pgvector
        </p>
      </footer>
    </div>
  );
}
