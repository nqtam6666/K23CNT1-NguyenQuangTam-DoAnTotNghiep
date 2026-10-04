import Link from 'next/link';
import { BookOpen, Video, Bot, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function TrangChu() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Điều hướng */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg">LMS Trường Học</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                K23CNT1
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dang-nhap"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/dang-ky"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Hệ thống Quản lý Học tập Thế hệ Mới
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Nền tảng Học tập Toàn diện <br className="hidden sm:inline" />
            Tích hợp <span className="text-blue-600">Phòng học LiveKit</span> &{' '}
            <span className="text-indigo-600">Trợ lý AI</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin (K23CNT1 - Sinh viên Nguyễn Quang Tâm).
            Tối ưu hóa trải nghiệm giảng dạy trực tuyến, quản lý học vụ và hỗ trợ học tập thông minh.
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
                  Phòng học ảo độ trễ thấp, chia sẻ màn hình, bảng trắng tương tác, tự động điểm danh
                  theo thời gian thực.
                </p>
              </div>

              {/* Thẻ 3: RAG AI */}
              <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Trợ lý AI Thông minh (RAG)</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Hỏi đáp ngữ nghĩa dựa trên giáo trình bài giảng, hỗ trợ sinh đề thi, trích dẫn chính
                  xác nguồn tài liệu lớp học.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>Đồ án Tốt nghiệp LMS Trường học - K23CNT1 Nguyễn Quang Tâm - MSSV: 2310900093</p>
        <p className="mt-1">Xây dựng trên nền tảng NestJS 10, Next.js 15, PostgreSQL 16 & pgvector</p>
      </footer>
    </div>
  );
}
