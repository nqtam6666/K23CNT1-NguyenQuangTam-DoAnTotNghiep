'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Mail,
  Phone,
  School,
  BellRing,
  Terminal,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { PayloadJwt, VaiTro } from '@lms/chung';
import { useCaiDatHeThong } from '../tien-ich/use-cai-dat';
import { ToggleTheme } from '@/components/ui/toggle-theme';

export default function TrangChu() {
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const [nguoiDungHienTai, setNguoiDungHienTai] = useState<PayloadJwt | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lms_cache_ho_so');
      if (raw) {
        const parsed = JSON.parse(raw) as PayloadJwt;
        if (parsed && parsed.email) {
          setNguoiDungHienTai(parsed);
        }
      }
    } catch {
      // Bỏ qua lỗi đọc sessionStorage
    }
  }, []);

  const tenHeThong = layGiaTri('TEN_HE_THONG', 'LMS Trường Học');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Quản lý Học tập');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLopKhoa = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');
  const emailLienHe = layGiaTri('EMAIL_LIEN_HE', 'nguyenquangtam179@gmail.com');
  const soDienThoai = layGiaTri('SO_DIEN_THOAI', '0987654321');
  const bannerTieuDe = layGiaTri(
    'BANNER_TIEU_DE',
    'Cổng Quản lý Học vụ & Lớp học Trực tuyến',
  );
  const bannerMoTa = layGiaTri(
    'BANNER_MO_TA',
    'Hệ thống quản lý lớp học phần, thời khóa biểu, điểm danh trực tuyến, kiểm tra đánh giá và tra cứu học liệu dành cho giảng viên và sinh viên.',
  );
  const thongBaoChung = layGiaTri('THONG_BAO_CHUNG');
  const urlLogo = layGiaTri('URL_LOGO');

  const danhMucPhanHe = [
    {
      ma: 'MOD-01',
      ten: 'Quản lý Học vụ & Đào tạo',
      phamVi: 'Năm học, học kỳ, môn học, lớp hành chính, phân công giảng dạy',
      trangThai: 'Đang vận hành',
    },
    {
      ma: 'MOD-02',
      ten: 'Không gian Lớp học phần',
      phamVi: 'Bảng tin, bài tập, kiểm tra trắc nghiệm, sổ điểm thành phần',
      trangThai: 'Đang vận hành',
    },
    {
      ma: 'MOD-03',
      ten: 'Phòng học Trực tuyến & Điểm danh',
      phamVi: 'Phòng học âm thanh/hình ảnh, điểm danh mã PIN 6 số, đơn xin nghỉ phép',
      trangThai: 'Đang vận hành',
    },
    {
      ma: 'MOD-04',
      ten: 'Tra cứu Học liệu',
      phamVi: 'Hỏi đáp giáo trình theo ngữ cảnh lớp học kèm trích dẫn nguồn tài liệu',
      trangThai: 'Đang vận hành',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text">
      {/* Thông báo hệ thống từ Cài đặt nếu có */}
      {thongBaoChung && (
        <div className="bg-accent-soft border-b border-border text-accent text-xs font-mono py-2 px-4 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>{thongBaoChung}</span>
          </div>
          <span className="eyebrow">THÔNG BÁO HỆ THỐNG</span>
        </div>
      )}

      {/* Header Điều hướng */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {urlLogo ? (
              <div className="h-8 w-auto max-w-[140px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={urlLogo} alt={tenHeThong} className="h-8 w-auto object-contain rounded" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white font-mono font-bold">
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-text text-[15px] tracking-tight">
                {tenHeThong}
              </span>
              {maLopKhoa && (
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-accent-soft text-accent border border-border">
                  {maLopKhoa}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ToggleTheme />
            {nguoiDungHienTai ? (
              <>
                {nguoiDungHienTai.vaiTro === VaiTro.QUAN_TRI_VIEN && (
                  <Link
                    href="/cai-dat"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text bg-bg border border-border rounded hover:bg-active-bg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    <span>Cài đặt hệ thống</span>
                  </Link>
                )}
                <Link
                  href="/bang-dieu-khien"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-accent rounded hover:brightness-95 transition-colors shadow-accent"
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                  <span>Về Bảng điều khiển</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dang-nhap"
                  className="px-3.5 py-2 text-[13px] font-semibold text-muted hover:text-text transition-colors"
                >
                  Đăng nhập
                </Link>
                {choPhepDangKy && (
                  <Link
                    href="/dang-ky"
                    className="px-4 py-2 text-[13px] font-semibold text-white bg-accent rounded hover:brightness-95 transition-colors shadow-accent"
                  >
                    Đăng ký tài khoản
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Vùng nội dung chính căn trái kiểu cổng kỹ thuật */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Khối định danh hệ thống */}
        <section className="bg-surface border border-border rounded p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <p className="eyebrow">{khauHieu}</p>
              <h1 className="text-[22px] sm:text-[24px] font-mono font-bold text-text tracking-tight">
                {bannerTieuDe}
              </h1>
              <p className="text-[14px] text-muted leading-[1.65] max-w-2xl">
                {bannerMoTa}
              </p>
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={nguoiDungHienTai ? '/bang-dieu-khien' : '/dang-nhap'}
                  className="inline-flex items-center gap-2 px-5 py-[11px] rounded text-[13px] text-white bg-accent font-semibold hover:brightness-95 transition-colors shadow-accent"
                >
                  {nguoiDungHienTai ? 'Về Bảng điều khiển' : 'Truy cập Bảng điều khiển'}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
                <a
                  href="http://localhost:4000/api/tai-lieu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-[11px] rounded text-[13px] text-muted hover:text-text bg-bg border border-border font-semibold transition-colors"
                >
                  <Terminal className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  Tài liệu API
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 bg-bg border border-border rounded p-4 space-y-3">
              <p className="eyebrow">THÔNG TIN ĐỊNH DANH</p>
              <dl className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted">Đơn vị</dt>
                  <dd className="font-mono font-medium text-text text-right">{tenTruong}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted">Tác giả</dt>
                  <dd className="font-mono font-medium text-text text-right">{tacGia}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <dt className="text-muted">Lớp / Khóa</dt>
                  <dd className="font-mono font-medium text-text text-right tabular-nums">{maLopKhoa}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted">Mã sinh viên</dt>
                  <dd className="font-mono font-bold text-accent text-right tabular-nums">{mssv}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Bảng danh mục phân hệ nghiệp vụ */}
        <section className="bg-surface border border-border rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">CẤU TRÚC HỆ THỐNG</p>
              <h2 className="text-[17px] font-mono font-bold text-text mt-0.5">
                Danh mục Phân hệ Nghiệp vụ
              </h2>
            </div>
            <span className="font-mono text-xs text-muted tabular-nums">
              {danhMucPhanHe.length} phân hệ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-3 px-4 w-28">Mã</th>
                  <th className="py-3 px-4">Tên phân hệ</th>
                  <th className="py-3 px-4">Phạm vi chức năng</th>
                  <th className="py-3 px-4 text-right w-40">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {danhMucPhanHe.map((ph) => (
                  <tr key={ph.ma}>
                    <td className="py-3 px-4 font-mono text-xs text-accent font-medium tabular-nums">
                      {ph.ma}
                    </td>
                    <td className="py-3 px-4 font-mono text-[13px] font-bold text-text">
                      {ph.ten}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-muted">
                      {ph.phamVi}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-soft text-accent font-mono text-[11px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {ph.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Thông tin liên hệ */}
        <section className="bg-surface border border-border rounded p-5">
          <p className="eyebrow mb-3">LIÊN HỆ TRỰC BAN HỌC VỤ</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
            <div className="flex items-center gap-3 p-3 rounded bg-bg border border-border">
              <School className="w-[18px] h-[18px] text-accent shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-xs text-muted">Cơ sở đào tạo</p>
                <p className="font-mono font-medium text-text truncate">{tenTruong}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded bg-bg border border-border">
              <Mail className="w-[18px] h-[18px] text-accent shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-xs text-muted">Thư điện tử hỗ trợ</p>
                <a
                  href={`mailto:${emailLienHe}`}
                  className="font-mono font-medium text-accent hover:underline truncate block"
                >
                  {emailLienHe}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded bg-bg border border-border">
              <Phone className="w-[18px] h-[18px] text-accent shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <p className="text-xs text-muted">Điện thoại trực ban</p>
                <p className="font-mono font-medium text-text tabular-nums">{soDienThoai}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-5 px-4 text-xs text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-text">
            {tenHeThong} — {maLopKhoa} — {tacGia} ({mssv})
          </p>
          <p>Bản quyền © 2026 {tenTruong}.</p>
        </div>
      </footer>
    </div>
  );
}
