'use client';

import {
  GraduationCap,
  Layers,
  BookOpen,
  CalendarCheck2,
  Video,
  FileCheck2,
  HelpCircle,
  Building2,
  Clock,
  Info,
} from 'lucide-react';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';

export default function TrangGioiThieu() {
  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'Hệ thống Quản lý Học tập LMS');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLop = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');

  return (
    <div className="space-y-6">
      {/* Banner đầu trang */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
            <GraduationCap className="w-6 h-6 text-blue-200" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Đồ án tốt nghiệp đại học
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{tenHeThong}</h1>
        <p className="mt-2 text-sm text-blue-100 max-w-3xl leading-relaxed">
          Giải pháp chuyển đổi số hỗ trợ công tác quản lý đào tạo, tổ chức lớp học phần trực tuyến,
          tương tác học tập và theo dõi tiến độ đào tạo dành cho cán bộ, giảng viên và sinh viên {tenTruong}.
        </p>
      </div>

      {/* Thông tin tác giả & Mục tiêu hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Khối thông tin thực hiện đồ án */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Thông tin thực hiện đề tài
          </h2>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Sinh viên thực hiện:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{tacGia}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Mã số sinh viên:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{mssv}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Lớp sinh hoạt / Khóa:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{maLop}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">Đơn vị đào tạo:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{tenTruong}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-medium text-slate-700 dark:text-slate-300">Năm học bảo vệ:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">2025 - 2026</span>
            </div>
          </div>
        </div>

        {/* Khối mục tiêu và định hướng */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Mục tiêu & Định hướng giáo dục
          </h2>
          <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              Hệ thống được thiết kế nhằm phục vụ toàn diện nhu cầu đào tạo học chế tín chỉ của nhà trường,
              hướng tới môi trường học tập số hiện đại, trực quan và thuận tiện cho mọi đối tượng người dùng:
            </p>
            <ul className="space-y-2 pt-1 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">•</span>
                <span>Số hóa và chuẩn hóa công tác tổ chức thời khóa biểu, quản lý lớp học phần và giảng dạy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">•</span>
                <span>Tăng cường tương tác trực tuyến giữa giảng viên và người học thông qua không gian học tập số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">•</span>
                <span>Theo dõi chuyên cần, đánh giá tiến độ học tập minh bạch và hỗ trợ học vụ tức thời.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Các phân hệ nghiệp vụ chính */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Các phân hệ nghiệp vụ chính
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Quản lý Đào tạo & Thời khóa biểu</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tổ chức kế hoạch đào tạo, lập thời khóa biểu tuần, quản lý phòng học và phân công giảng viên giảng dạy.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Lớp học phần Trực tuyến</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Không gian lớp học trực tuyến tích hợp phòng họp ảo, bảng điểm danh tự động và trao đổi thảo luận giữa các thành viên.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Học liệu số & Đánh giá</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Lưu trữ tài liệu bài giảng, giao nộp bài tập trực tuyến, chấm điểm và phản hồi kết quả học tập cho sinh viên.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Sổ liên lạc & Hỗ trợ học tập</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Theo dõi kết quả học tập, chuyên cần cá nhân, nhận thông báo đào tạo và hỗ trợ giải đáp thắc mắc học vụ.
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin hỗ trợ & Bản quyền */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          Thông tin hỗ trợ & Bản quyền phần mềm
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Cơ quan chủ quản</p>
            <p>{tenTruong}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Phòng Đào tạo & Quản lý Khoa học</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Hỗ trợ kỹ thuật</p>
            <p>Ban Quản trị Hệ thống Thông tin</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Thời gian hỗ trợ: Giờ hành chính (Thứ 2 - Thứ 6)</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Phiên bản phát hành</p>
            <p className="font-mono text-slate-800 dark:text-slate-200">Phiên bản 1.0.0</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Cập nhật: Năm học 2025 - 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
