'use client';

import {
  GraduationCap,
  Layers,
  BookOpen,
  CalendarCheck2,
  Video,
  FileCheck2,
  Building2,
  Info,
} from 'lucide-react';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';
import { TheKhung } from '../../../thanh-phan/the-khung';

export default function TrangGioiThieu() {
  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLop = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');

  return (
    <div className="space-y-6">
      {/* Header giới thiệu chuẩn Warm Minimal */}
      <TheKhung
        icon={GraduationCap}
        eyebrow={`ĐỒ ÁN TỐT NGHIỆP ĐẠI HỌC · ${tenHeThong}`}
        tieuDe="Nghiên cứu, thiết kế và phát triển hệ thống lớp học số tích hợp trí tuệ nhân tạo SmartClass AI"
      >
        <p className="text-sm text-[var(--muted)] max-w-4xl leading-relaxed">
          Ứng dụng trí tuệ nhân tạo trong xây dựng hệ thống lớp học số toàn diện: điểm danh thông
          minh, luyện tập, thi thử và quản lý kết quả học phần dành cho cán bộ, giảng viên và người
          học tại {tenTruong}.
        </p>
      </TheKhung>

      {/* Thông tin tác giả & Mục tiêu hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TheKhung
          icon={Layers}
          eyebrow="THÔNG TIN ĐỊNH DANH"
          tieuDe="Thông tin thực hiện đề tài"
        >
          <div className="space-y-2.5 text-sm text-[var(--muted)]">
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span>Sinh viên thực hiện:</span>
              <span className="font-mono font-semibold text-[var(--text)]">{tacGia}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span>Mã số sinh viên:</span>
              <span className="font-mono font-semibold text-[var(--accent)]">{mssv}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span>Lớp sinh hoạt / Khóa:</span>
              <span className="font-mono font-semibold text-[var(--text)]">{maLop}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[var(--border)]">
              <span>Đơn vị đào tạo:</span>
              <span className="font-mono font-semibold text-[var(--text)]">{tenTruong}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Năm học bảo vệ:</span>
              <span className="font-mono font-semibold text-[var(--text)]">2025 - 2026</span>
            </div>
          </div>
        </TheKhung>

        <TheKhung
          icon={BookOpen}
          eyebrow="ĐỊNH HƯỚNG GIÁO DỤC"
          tieuDe="Mục tiêu & Trọng tâm nghiên cứu"
        >
          <div className="space-y-3 text-sm text-[var(--muted)] leading-relaxed">
            <p>
              Đề tài tập trung giải quyết bài toán số hóa lớp học theo học chế tín chỉ kết hợp trợ
              lý học thuật thông minh:
            </p>
            <ul className="space-y-2.5 pt-1 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-[var(--accent)] font-bold shrink-0">01.</span>
                <span>
                  Điểm danh thông minh bằng mã PIN thời gian thực, đồng bộ hiện diện trực tuyến và
                  cảnh báo chuyên cần sớm.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-[var(--accent)] font-bold shrink-0">02.</span>
                <span>
                  Hỗ trợ biên soạn câu hỏi luyện tập, tổ chức thi thử bấm giờ từ giáo trình môn học
                  và giải thích đáp án chi tiết.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-mono text-[var(--accent)] font-bold shrink-0">03.</span>
                <span>
                  Quản lý kết quả học phần đa thang điểm (Hệ 10, Hệ 4, Điểm chữ) kèm phân tích và
                  tư vấn lộ trình học tập cá nhân hóa.
                </span>
              </li>
            </ul>
          </div>
        </TheKhung>
      </div>

      {/* Các phân hệ nghiệp vụ chính */}
      <TheKhung
        icon={Building2}
        eyebrow="KIẾN TRÚC NGHIỆP VỤ"
        tieuDe="4 Trụ cột nghiệp vụ của SmartClass AI"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)] space-y-2.5">
            <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center">
              <CalendarCheck2 strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-[var(--text)] text-sm">
              Điểm danh & Chuyên cần
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Điểm danh bằng mã PIN có thời hạn, tự động đối soát phiên học trực tuyến, duyệt đơn
              xin nghỉ phép và cảnh báo nguy cơ cấm thi.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)] space-y-2.5">
            <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center">
              <FileCheck2 strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-[var(--text)] text-sm">
              Luyện tập & Thi thử
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Biên soạn đề trắc nghiệm từ học liệu môn học, tổ chức phòng thi thử bấm giờ, chấm
              điểm tức thì và giải thích từng câu hỏi.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)] space-y-2.5">
            <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center">
              <GraduationCap strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-[var(--text)] text-sm">
              Quản lý kết quả học phần
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Đồng bộ tự động điểm chuyên cần, bài tập, thi thử; quy đổi điểm Hệ 10, Hệ 4, Điểm chữ
              và nhận xét năng lực học phần cá nhân hóa.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)] space-y-2.5">
            <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center">
              <Video strokeWidth={1.5} className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-[var(--text)] text-sm">
              Phòng học số & Trợ lý AI
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Không gian lớp học trực tuyến thời gian thực kết hợp trợ lý hỏi đáp học liệu môn học
              hỗ trợ giảng viên và sinh viên 24/7.
            </p>
          </div>
        </div>
      </TheKhung>

      {/* Thông tin hỗ trợ & Bản quyền */}
      <TheKhung
        icon={Info}
        eyebrow="THÔNG TIN VẬN HÀNH"
        tieuDe="Thông tin hỗ trợ & Bản quyền phần mềm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--muted)]">
          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)]">
            <p className="eyebrow mb-1">CƠ QUAN CHỦ QUẢN</p>
            <p className="font-mono font-semibold text-[var(--text)]">{tenTruong}</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Phòng Đào tạo & Quản lý Khoa học</p>
          </div>
          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)]">
            <p className="eyebrow mb-1">HỖ TRỢ KỸ THUẬT</p>
            <p className="font-mono font-semibold text-[var(--text)]">
              Ban Quản trị Hệ thống Thông tin
            </p>
            <p className="text-[11px] text-[var(--muted)] mt-1">
              Thời gian hỗ trợ: Giờ hành chính (Thứ 2 - Thứ 6)
            </p>
          </div>
          <div className="p-4 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)]">
            <p className="eyebrow mb-1">PHIÊN BẢN PHÁT HÀNH</p>
            <p className="font-mono font-semibold text-[var(--accent)]">v1.0.0</p>
            <p className="text-[11px] text-[var(--muted)] mt-1">Cập nhật: Năm học 2025 - 2026</p>
          </div>
        </div>
      </TheKhung>
    </div>
  );
}
