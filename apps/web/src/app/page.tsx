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
  Users,
  GraduationCap,
  LogOut,
  Bot,
  CheckCircle2,
  FileText,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Calendar,
  Play,
  Layers,
  Award,
  Clock,
  KeyRound,
} from 'lucide-react';
import { PayloadJwt, VaiTro, layNhanVaiTro } from '@lms/chung';
import { useQueryClient } from '@tanstack/react-query';
import { useCaiDatHeThong } from '../tien-ich/use-cai-dat';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import { thongBao } from '../tien-ich/thong-bao';
import { AnhDaiDien } from '../thanh-phan/anh-dai-dien';
import { ToggleTheme } from '@/components/ui/toggle-theme';

const TAI_KHOAN_TRAI_NGHIEM_NHANH = [
  {
    nhan: 'Quản trị viên',
    vaiTro: VaiTro.QUAN_TRI_VIEN,
    email: 'admin@lms.edu.vn',
    matKhau: 'MatKhau@123',
    moTa: 'Toàn quyền hệ thống, cấu hình AI & giám sát nhật ký',
  },
  {
    nhan: 'Giảng viên',
    vaiTro: VaiTro.GIAO_VIEN,
    email: 'giaovien1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    moTa: 'Quản lý lớp, sinh đề từ tài liệu, chấm điểm & cảnh báo sớm',
  },
  {
    nhan: 'Sinh viên',
    vaiTro: VaiTro.HOC_SINH,
    email: 'hocsinh1@lms.edu.vn',
    matKhau: 'MatKhau@123',
    moTa: 'Học tập, làm bài kiểm tra, điểm danh PIN & hỏi đáp AI',
  },
  {
    nhan: 'Giáo vụ',
    vaiTro: VaiTro.GIAO_VU,
    email: 'giaovu@lms.edu.vn',
    matKhau: 'MatKhau@123',
    moTa: 'Điều phối năm học, môn học, lớp học phần & danh sách lớp',
  },
];

export default function TrangChu() {
  const queryClient = useQueryClient();
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const [nguoiDungHienTai, setNguoiDungHienTai] = useState<PayloadJwt | null>(null);
  const [dangDangXuat, setDangDangXuat] = useState(false);
  const [emailDangChuyen, setEmailDangChuyen] = useState<string | null>(null);
  const [mucDoMoPhong, setMucDoMoPhong] = useState<'CO_BAN' | 'TRUNG_BINH' | 'NANG_CAO'>('TRUNG_BINH');

  // Đồng bộ trạng thái đăng nhập thực tế với máy chủ (thống nhất 100% với /bang-dieu-khien)
  useEffect(() => {
    let daHuy = false;

    try {
      const raw =
        sessionStorage.getItem('lms_cache_ho_so') || localStorage.getItem('lms_cache_ho_so');
      if (raw) {
        const parsed = JSON.parse(raw) as PayloadJwt;
        if (parsed && parsed.email) {
          setNguoiDungHienTai(parsed);
        }
      }
    } catch {
      // Bỏ qua lỗi đọc bộ nhớ trình duyệt
    }

    mayKhachApi
      .get('/xac-thuc/ho-so-hien-tai')
      .then((res) => {
        if (daHuy) return;
        const duLieu = (res.data?.duLieu || res.data) as PayloadJwt;
        if (duLieu && duLieu.email) {
          setNguoiDungHienTai(duLieu);
          try {
            const chuoi = JSON.stringify(duLieu);
            sessionStorage.setItem('lms_cache_ho_so', chuoi);
            localStorage.setItem('lms_cache_ho_so', chuoi);
          } catch {
            // Bỏ qua
          }
        }
      })
      .catch(() => {
        if (daHuy) return;
        setNguoiDungHienTai(null);
        try {
          sessionStorage.removeItem('lms_cache_ho_so');
          sessionStorage.removeItem('lms_cache_bang_dieu_khien');
          localStorage.removeItem('lms_cache_ho_so');
          localStorage.removeItem('lms_cache_bang_dieu_khien');
        } catch {
          // Bỏ qua
        }
      });

    return () => {
      daHuy = true;
    };
  }, []);

  const xuLyDangNhapNhanh = async (email: string, matKhau: string, nhanVaiTro: string) => {
    setEmailDangChuyen(email);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', { email, matKhau });
      const nguoiDungMoi = phanHoi.data?.duLieu?.nguoiDung || phanHoi.data?.nguoiDung;

      try {
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
        localStorage.removeItem('lms_cache_bang_dieu_khien');
        if (nguoiDungMoi) {
          const chuoiHoSo = JSON.stringify(nguoiDungMoi);
          sessionStorage.setItem('lms_cache_ho_so', chuoiHoSo);
          localStorage.setItem('lms_cache_ho_so', chuoiHoSo);
        }
      } catch {
        // Bỏ qua
      }

      queryClient.clear();
      thongBao.thanhCong(
        `Đã đăng nhập vai trò ${nhanVaiTro}`,
        `Đang mở Bảng điều khiển của ${nguoiDungMoi?.hoTen || email}...`,
      );
      setTimeout(() => {
        window.location.href = '/bang-dieu-khien';
      }, 350);
    } catch {
      thongBao.thatBai('Không thể chuyển tài khoản', 'Vui lòng thử lại tại trang đăng nhập.');
      setEmailDangChuyen(null);
    }
  };

  const xuLyDangXuat = async () => {
    setDangDangXuat(true);
    try {
      await mayKhachApi.post('/xac-thuc/dang-xuat');
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      try {
        sessionStorage.removeItem('lms_cache_ho_so');
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
        localStorage.removeItem('lms_cache_ho_so');
        localStorage.removeItem('lms_cache_bang_dieu_khien');
      } catch {
        // Bỏ qua
      }
      queryClient.clear();
      setNguoiDungHienTai(null);
      setDangDangXuat(false);
      thongBao.thanhCong('Đã đăng xuất', 'Phiên làm việc đã kết thúc an toàn.');
    }
  };

  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const khauHieu = layGiaTri('KHAU_HIEU', 'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLopKhoa = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');
  const emailLienHe = layGiaTri('EMAIL_LIEN_HE', 'nguyenquangtam179@gmail.com');
  const soDienThoai = layGiaTri('SO_DIEN_THOAI', '0987654321');
  const bannerTieuDe = layGiaTri(
    'BANNER_TIEU_DE',
    'Nền tảng Quản lý Lớp học số & Trợ lý Học thuật Thông minh',
  );
  const bannerMoTa = layGiaTri(
    'BANNER_MO_TA',
    'Đồng bộ toàn diện hoạt động giảng dạy, học liệu số, phòng học trực tuyến, kiểm tra đánh giá, phân tích tiến độ người học và trợ lý hỏi đáp giáo trình có trích dẫn nguồn.',
  );
  const thongBaoChung = layGiaTri('THONG_BAO_CHUNG');
  const urlLogo = layGiaTri('URL_LOGO');

  const laQuanTriVien = nguoiDungHienTai?.vaiTro === VaiTro.QUAN_TRI_VIEN;

  const sauNhomChucNang = [
    {
      ma: 'NHÓM 01',
      tieuDe: 'Quản lý lớp học số',
      moTa: 'Quản lý người dùng đa vai trò, môn học, lớp học phần, bài giảng, video, lịch học, điểm danh PIN 6 số, nộp bài và chấm điểm.',
      bieuTuong: BookOpen,
      diemNhan: ['Điểm danh mã PIN 6 số trực tuyến', 'Nộp bài, chấm điểm & sổ điểm thành phần'],
      duongDan: '/lop-hoc-phan',
    },
    {
      ma: 'NHÓM 02',
      tieuDe: 'Trợ lý học tập SmartClass AI',
      moTa: 'Hỏi đáp bám sát giáo trình và slide môn học kèm trích dẫn nguồn tài liệu. Tùy chỉnh 3 mức độ giải thích và từ chối suy đoán ngoài học liệu.',
      bieuTuong: Bot,
      diemNhan: ['Giải thích Cơ bản · Trung bình · Nâng cao', 'Gợi ý câu hỏi tiếp theo & bài tập tự luyện'],
      duongDan: '/tro-ly-ai',
    },
    {
      ma: 'NHÓM 03',
      tieuDe: 'AI hỗ trợ giảng viên',
      moTa: 'Sinh câu hỏi từ tài liệu theo chương và độ khó, tạo đề kiểm tra kèm lời giải, gợi ý giáo án bài giảng và hỗ trợ nhận xét bài nộp.',
      bieuTuong: Layers,
      diemNhan: ['Sinh bộ câu hỏi ôn tập riêng từng chương', 'Giảng viên kiểm duyệt kết quả cuối cùng'],
      duongDan: '/tro-ly-ai',
    },
    {
      ma: 'NHÓM 04',
      tieuDe: 'Phân tích học tập (Learning Analytics)',
      moTa: 'Dashboard kết quả học tập theo lớp và từng sinh viên, theo dõi tỷ lệ hoàn thành bài tập, cảnh báo sớm sinh viên chậm tiến độ.',
      bieuTuong: BarChart3,
      diemNhan: ['Cảnh báo sớm nguy cơ học vụ 3 mức độ', 'Đề xuất nội dung ôn tập từ câu trả lời sai'],
      duongDan: '/lop-hoc-phan',
    },
    {
      ma: 'NHÓM 05',
      tieuDe: 'Tương tác lớp học',
      moTa: 'Diễn đàn hỏi đáp theo môn học, thảo luận nhóm, bình luận bài giảng, phòng học âm thanh/hình ảnh, thông báo hạn nộp và đánh giá học liệu.',
      bieuTuong: MessageSquare,
      diemNhan: ['Phòng học trực tuyến tích hợp điểm danh', 'Hệ thống phản hồi & đánh giá học liệu 1–5 sao'],
      duongDan: '/thoi-khoa-bieu',
    },
    {
      ma: 'NHÓM 06',
      tieuDe: 'Quản trị và an toàn',
      moTa: 'Phân quyền theo vai trò và lớp học, bảo vệ học liệu & lịch sử hội thoại, quản lý chi phí mô hình AI, giới hạn lượt hỏi và nhật ký hoạt động.',
      bieuTuong: ShieldCheck,
      diemNhan: ['Giám sát lưu lượng Token & hạn mức lượt hỏi', 'Quản lý phiên bản học liệu & quy tắc AI'],
      duongDan: '/cai-dat',
    },
  ];

  const baVaiTroTrongTam = [
    {
      vaiTro: 'Giảng viên',
      moTa: 'Quản lý lớp học, xây dựng học liệu nhiều phiên bản, giao bài tập, tổ chức kiểm tra, biên soạn đề từ tài liệu và theo dõi phân tích học tập.',
      danhSachMuc: [
        'Tải lên giáo trình, phiên bản học liệu & lập chỉ mục tra cứu',
        'Sinh đề kiểm tra, giáo án & nhận xét gợi ý từ tài liệu môn học',
        'Theo dõi cảnh báo sớm sinh viên chậm tiến độ để can thiệp kịp thời',
      ],
      emailMau: 'giaovien1@lms.edu.vn',
      duongDan: '/lop-hoc-phan',
    },
    {
      vaiTro: 'Sinh viên',
      moTa: 'Tham gia lớp học trực tuyến, truy cập học liệu, làm bài tập và bài kiểm tra, trao đổi với giảng viên và nhận hỗ trợ ôn tập từ Trợ lý AI.',
      danhSachMuc: [
        'Tra cứu kiến thức giáo trình theo 3 mức độ Cơ bản / Trung bình / Nâng cao',
        'Nhận lộ trình ôn tập cá nhân hóa dựa trên các câu hỏi trả lời sai',
        'Điểm danh mã PIN 6 số, nộp bài tập và đánh giá chất lượng học liệu',
      ],
      emailMau: 'hocsinh1@lms.edu.vn',
      duongDan: '/tro-ly-ai',
    },
    {
      vaiTro: 'Quản trị viên',
      moTa: 'Quản lý tài khoản, phân quyền truy cập, điều phối học vụ toàn trường, cấu hình quy tắc sử dụng AI và giám sát lưu lượng hệ thống.',
      danhSachMuc: [
        'Quản lý người dùng, năm học, học kỳ, môn học và phân công giảng dạy',
        'Cấu hình hạn mức lượt hỏi AI mỗi ngày và giám sát chi phí Token',
        'Theo dõi nhật ký hoạt động, phiên đăng nhập và xử lý phản hồi người dùng',
      ],
      emailMau: 'admin@lms.edu.vn',
      duongDan: '/cai-dat',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Thông báo hệ thống từ Cài đặt nếu có */}
      {thongBaoChung && (
        <div className="bg-[var(--accent-soft)] border-b border-[var(--border)] text-[var(--accent)] text-xs font-medium py-2 px-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>{thongBaoChung}</span>
          </div>
          <span className="eyebrow">THÔNG BÁO HỆ THỐNG</span>
        </div>
      )}

      {/* Header Điều hướng đồng bộ trạng thái đăng nhập 100% với Bảng điều khiển */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              {urlLogo ? (
                <div className="h-9 w-auto max-w-[140px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urlLogo}
                    alt={tenHeThong}
                    className="h-9 w-auto object-contain rounded-[var(--radius)]"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent)] flex items-center justify-center text-white font-bold">
                  <School className="w-4 h-4" strokeWidth={1.75} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-sans font-semibold text-[var(--text)] text-[15px] tracking-tight">
                  {tenHeThong}
                </span>
                {maLopKhoa && (
                  <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)]">
                    {maLopKhoa}
                  </span>
                )}
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-[var(--muted)]">
              <a href="#nhom-chuc-nang" className="hover:text-[var(--accent)] transition-colors">
                6 Nhóm chức năng
              </a>
              <a href="#ba-vai-tro" className="hover:text-[var(--accent)] transition-colors">
                Vai trò đào tạo
              </a>
              <Link href="/lop-hoc-phan" className="hover:text-[var(--accent)] transition-colors">
                Lớp học phần
              </Link>
              <Link href="/tro-ly-ai" className="hover:text-[var(--accent)] transition-colors">
                Trợ lý SmartClass AI
              </Link>
              <a href="#lien-he" className="hover:text-[var(--accent)] transition-colors">
                Thông tin học vụ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ToggleTheme />

            {nguoiDungHienTai ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/ho-so"
                  className="hidden md:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
                  title="Xem hồ sơ cá nhân"
                >
                  <AnhDaiDien
                    url={nguoiDungHienTai.anhDaiDien}
                    hoTen={nguoiDungHienTai.hoTen}
                    kichThuoc="sm"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-[var(--text)] max-w-[140px] truncate">
                      {nguoiDungHienTai.hoTen}
                    </p>
                    <p className="text-[10px] font-medium text-[var(--accent)]">
                      {layNhanVaiTro(nguoiDungHienTai.vaiTro)}
                    </p>
                  </div>
                </Link>

                {laQuanTriVien && (
                  <Link
                    href="/cai-dat"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}

                <Link
                  href="/bang-dieu-khien"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-[13px] font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:brightness-95 transition-colors shadow-accent"
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                  <span>Vào Bảng điều khiển</span>
                </Link>

                <button
                  type="button"
                  onClick={xuLyDangXuat}
                  disabled={dangDangXuat}
                  title="Đăng xuất tài khoản"
                  className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-[var(--danger)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--danger-soft)] hover:border-[var(--danger)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span className="hidden xl:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/dang-nhap"
                  className="px-3.5 py-2 text-[13px] font-semibold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--accent)] transition-colors"
                >
                  Đăng nhập
                </Link>
                {choPhepDangKy && (
                  <Link
                    href="/dang-ky"
                    className="px-4 py-2 text-[13px] font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:brightness-95 transition-colors shadow-accent"
                  >
                    Đăng ký tài khoản
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Vùng nội dung chính */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* PHẦN 1: HERO BENTO 2 CỘT (GIỚI THIỆU HỌC VỤ + MÔ PHỎNG TRỢ LÝ AI & ĐĂNG NHẬP 1 CHẠM) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Cột trái (7 cột): Định vị nền tảng & Chỉ số trọng tâm */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold">
                <School className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{tenTruong} · Đồ án Tốt nghiệp {maLopKhoa}</span>
              </div>

              <h1 className="text-[24px] sm:text-[30px] font-sans font-semibold text-[var(--text)] tracking-tight leading-[1.28]">
                {bannerTieuDe}
              </h1>

              <p className="text-[14px] text-[var(--muted)] leading-[1.7] max-w-2xl">
                {bannerMoTa}
              </p>

              {/* Các nút điều hướng chính */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={nguoiDungHienTai ? '/bang-dieu-khien' : '/dang-nhap'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius)] text-[13px] text-white bg-[var(--accent)] font-semibold hover:brightness-95 transition-colors shadow-accent"
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
                  <span>
                    {nguoiDungHienTai
                      ? `Mở Bảng điều khiển (${layNhanVaiTro(nguoiDungHienTai.vaiTro)})`
                      : 'Đăng nhập vào Không gian học tập'}
                  </span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </Link>

                <Link
                  href={nguoiDungHienTai ? '/tro-ly-ai' : '/dang-nhap'}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] text-[13px] text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] font-semibold transition-colors"
                >
                  <Bot className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                  <span>Trợ lý học tập SmartClass AI</span>
                </Link>

                <a
                  href="http://localhost:4000/api/tai-lieu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius)] text-xs text-[var(--muted)] hover:text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] font-semibold transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                  <span>Tài liệu OpenAPI</span>
                </a>
              </div>
            </div>

            {/* 4 ô chỉ số năng lực cốt lõi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[var(--border)]">
              <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <p className="font-mono text-lg font-bold text-[var(--accent)] tabular-nums">06</p>
                <p className="text-xs font-semibold text-[var(--text)] mt-0.5">Nhóm chức năng</p>
                <p className="text-[11px] text-[var(--muted)]">Đầy đủ 30 nghiệp vụ</p>
              </div>
              <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <p className="font-mono text-lg font-bold text-[var(--accent)] tabular-nums">3 mức</p>
                <p className="text-xs font-semibold text-[var(--text)] mt-0.5">Giải thích học liệu</p>
                <p className="text-[11px] text-[var(--muted)]">Cơ bản · Vừa · Nâng cao</p>
              </div>
              <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <p className="font-mono text-lg font-bold text-[var(--accent)] tabular-nums">100%</p>
                <p className="text-xs font-semibold text-[var(--text)] mt-0.5">Trích dẫn giáo trình</p>
                <p className="text-[11px] text-[var(--muted)]">Chống suy đoán ngoài luồng</p>
              </div>
              <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <p className="font-mono text-lg font-bold text-[var(--accent)] tabular-nums">PIN 6 số</p>
                <p className="text-xs font-semibold text-[var(--text)] mt-0.5">Điểm danh & Phòng học</p>
                <p className="text-[11px] text-[var(--muted)]">Thời gian thực tại lớp</p>
              </div>
            </div>
          </div>

          {/* Cột phải (5 cột): Mô phỏng Trợ lý học tập AI & Chuyển nhanh vai trò */}
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            {/* Hộp mô phỏng trực quan Trợ lý SmartClass AI */}
            <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[var(--radius)] bg-[var(--accent)] text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">
                      Mô phỏng Trợ lý học tập SmartClass AI
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      Hỏi đáp theo giáo trình môn học kèm trích dẫn nguồn
                    </p>
                  </div>
                </div>

                {/* Bộ chọn mức độ giải thích trực tiếp */}
                <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] p-0.5 rounded-[var(--radius)]">
                  {(
                    [
                      { ma: 'CO_BAN', nhan: 'Cơ bản' },
                      { ma: 'TRUNG_BINH', nhan: 'Trung bình' },
                      { ma: 'NANG_CAO', nhan: 'Nâng cao' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.ma}
                      type="button"
                      onClick={() => setMucDoMoPhong(m.ma)}
                      className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold transition-colors cursor-pointer ${
                        mucDoMoPhong === m.ma
                          ? 'bg-[var(--accent)] text-white'
                          : 'text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {m.nhan}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="ml-6 p-2.5 rounded-[var(--radius)] bg-[var(--accent)] text-white font-medium">
                  Giải thích cấu trúc rẽ nhánh và vòng lặp trong tài liệu Lập trình Python?
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-2">
                  <p className="text-[var(--text)] leading-relaxed">
                    {mucDoMoPhong === 'CO_BAN'
                      ? 'Ở mức Cơ bản: Cấu trúc if/elif/else giúp chương trình chọn nhánh thực thi theo điều kiện đúng/sai, còn vòng lặp for/while giúp lặp lại khối lệnh tự động kèm ví dụ minh họa từng dòng.'
                      : mucDoMoPhong === 'NANG_CAO'
                        ? 'Ở mức Nâng cao: Phân tích độ phức tạp thuật toán O(n), tối ưu hóa vòng lặp lồng nhau bằng List Comprehension, cơ chế cấp phát bộ nhớ iterator và xử lý điều kiện biên.'
                        : 'Ở mức Trung bình: Trình bày cú pháp chuẩn của if-elif-else, vòng lặp for qua dãy range(), điều kiện dừng while và quy tắc thụt lề 4 khoảng trắng theo giáo trình.'}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border)] text-[11px]">
                    <span className="inline-flex items-center gap-1 font-mono text-[var(--accent)] font-medium">
                      <FileText className="w-3 h-3" />
                      Giáo trình Python Chương 2 · Đoạn 4 (96% khớp)
                    </span>
                    <Link
                      href={nguoiDungHienTai ? '/tro-ly-ai' : '/dang-nhap'}
                      className="font-semibold text-[var(--accent)] hover:underline"
                    >
                      Thử ngay →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối chuyển nhanh tài khoản mẫu phục vụ kiểm thử / chấm đồ án */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                  Đăng nhập / Chuyển nhanh vai trò (1 chạm)
                </span>
                <span className="font-mono text-[11px] text-[var(--muted)]">
                  Mật khẩu: <strong className="text-[var(--text)]">MatKhau@123</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {TAI_KHOAN_TRAI_NGHIEM_NHANH.map((tk) => {
                  const dangLaVaiTroNay = nguoiDungHienTai?.email === tk.email;
                  const dangXuLyNutNay = emailDangChuyen === tk.email;

                  return (
                    <button
                      key={tk.email}
                      type="button"
                      disabled={Boolean(emailDangChuyen)}
                      onClick={() => xuLyDangNhapNhanh(tk.email, tk.matKhau, tk.nhan)}
                      className={`text-left p-2.5 rounded-[var(--radius)] border transition-colors cursor-pointer ${
                        dangLaVaiTroNay
                          ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
                          : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[var(--text)]">{tk.nhan}</span>
                        <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">
                          {dangXuLyNutNay
                            ? 'Đang mở...'
                            : dangLaVaiTroNay
                              ? 'Đang dùng'
                              : 'Vào ngay →'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{tk.moTa}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* BẢNG ĐIỀU HƯỚNG NHANH CHO QUẢN TRỊ VIÊN KHI ĐANG ĐĂNG NHẬP */}
        {laQuanTriVien && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="eyebrow">KHÔNG GIAN QUẢN TRỊ VIÊN HỆ THỐNG</p>
                <h2 className="text-base font-sans font-semibold text-[var(--text)]">
                  Trung tâm điều hành, phân quyền và giám sát an toàn SmartClass AI
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold">
                Đang đăng nhập: {nguoiDungHienTai?.hoTen} ({nguoiDungHienTai?.email})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                href="/nguoi-dung"
                className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                    Quản lý người dùng & Vai trò
                  </p>
                  <p className="text-[11px] text-[var(--muted)] truncate">
                    Tài khoản, phân quyền & phiên đăng nhập
                  </p>
                </div>
              </Link>

              <Link
                href="/hoc-vu"
                className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                    Quản lý Học vụ & Đào tạo
                  </p>
                  <p className="text-[11px] text-[var(--muted)] truncate">
                    Năm học, môn học, lớp học phần
                  </p>
                </div>
              </Link>

              <Link
                href="/tro-ly-ai"
                className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                    Giám sát Trợ lý AI & Chi phí
                  </p>
                  <p className="text-[11px] text-[var(--muted)] truncate">
                    Lưu lượng token, chi phí & hạn mức lượt hỏi
                  </p>
                </div>
              </Link>

              <Link
                href="/cai-dat"
                className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                    Cài đặt Hệ thống & Quy tắc AI
                  </p>
                  <p className="text-[11px] text-[var(--muted)] truncate">
                    74 tham số cấu hình toàn trường
                  </p>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* PHẦN 2: KIẾN TRÚC 6 NHÓM CHỨC NĂNG CỐT LÕI (BENTO GRID 6 THẺ) */}
        <section id="nhom-chuc-nang" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="eyebrow">CẤU TRÚC CHỨC NĂNG HỆ THỐNG</p>
              <h2 className="text-[20px] font-sans font-semibold text-[var(--text)] mt-0.5">
                6 Nhóm Nghiệp vụ Cốt lõi của SmartClass AI
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)]">
              Thiết kế đồng bộ từ quản lý lớp học, biên soạn học liệu, hỏi đáp giáo trình đến phân tích học tập
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sauNhomChucNang.map((nhom) => {
              const BieuTuong = nhom.bieuTuong;
              return (
                <div
                  key={nhom.ma}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[var(--accent)] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                        <BieuTuong className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                        {nhom.ma}
                      </span>
                    </div>

                    <h3 className="text-[16px] font-sans font-semibold text-[var(--text)]">
                      {nhom.tieuDe}
                    </h3>

                    <p className="text-xs text-[var(--muted)] leading-relaxed">{nhom.moTa}</p>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[var(--border)]">
                    {nhom.diemNhan.map((dn) => (
                      <div key={dn} className="flex items-center gap-2 text-xs text-[var(--text)]">
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-[var(--accent)] shrink-0"
                          strokeWidth={1.75}
                        />
                        <span>{dn}</span>
                      </div>
                    ))}

                    <div className="pt-1">
                      <Link
                        href={nguoiDungHienTai ? nhom.duongDan : '/dang-nhap'}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                      >
                        <span>Mở phân hệ</span>
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PHẦN 3: QUY TRÌNH PHỐI HỢP 3 VAI TRÒ TRỌNG TÂM */}
        <section id="ba-vai-tro" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="eyebrow">PHÂN QUYỀN & TÁC NGHIỆP THEO VAI TRÒ</p>
              <h2 className="text-[20px] font-sans font-semibold text-[var(--text)] mt-0.5">
                Không gian làm việc chuyên biệt cho Giảng viên, Sinh viên & Quản trị viên
              </h2>
            </div>
            <span className="font-mono text-xs text-[var(--muted)]">
              Kiểm soát quyền truy cập theo từng lớp học phần
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {baVaiTroTrongTam.map((vt) => (
              <div
                key={vt.vaiTro}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold">
                      Vai trò: {vt.vaiTro}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--muted)]">{vt.emailMau}</span>
                  </div>

                  <p className="text-xs text-[var(--muted)] leading-relaxed">{vt.moTa}</p>

                  <ul className="space-y-2 pt-1">
                    {vt.danhSachMuc.map((muc) => (
                      <li key={muc} className="flex items-start gap-2 text-xs text-[var(--text)]">
                        <CheckCircle2
                          className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5"
                          strokeWidth={1.75}
                        />
                        <span>{muc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => xuLyDangNhapNhanh(vt.emailMau, 'MatKhau@123', vt.vaiTro)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Trải nghiệm vai trò {vt.vaiTro}</span>
                  </button>

                  <Link
                    href={nguoiDungHienTai ? vt.duongDan : '/dang-nhap'}
                    className="px-3 py-1.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text)] transition-colors"
                  >
                    Truy cập →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHẦN 4: THÔNG TIN ĐỊNH DANH ĐỒ ÁN & LIÊN HỆ HỌC VỤ */}
        <section id="lien-he" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs space-y-3">
            <p className="eyebrow">THÔNG TIN ĐỒ ÁN TỐT NGHIỆP</p>
            <h3 className="text-base font-sans font-semibold text-[var(--text)]">
              Định danh công trình & Tác giả thực hiện
            </h3>
            <dl className="space-y-2.5 text-[13px] pt-1">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <dt className="text-[var(--muted)]">Cơ sở đào tạo</dt>
                <dd className="font-sans font-semibold text-[var(--text)] text-right">
                  {tenTruong}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <dt className="text-[var(--muted)]">Sinh viên thực hiện</dt>
                <dd className="font-sans font-semibold text-[var(--text)] text-right">{tacGia}</dd>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                <dt className="text-[var(--muted)]">Lớp / Khóa đào tạo</dt>
                <dd className="font-mono font-medium text-[var(--text)] text-right tabular-nums">
                  {maLopKhoa}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-[var(--muted)]">Mã số sinh viên</dt>
                <dd className="font-mono font-bold text-[var(--accent)] text-right tabular-nums">
                  {mssv}
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <p className="eyebrow">LIÊN HỆ TRỰC BAN HỌC VỤ & HỖ TRỢ KỸ THUẬT</p>
              <h3 className="text-base font-sans font-semibold text-[var(--text)] mt-0.5">
                Kênh tiếp nhận hỗ trợ giảng viên và sinh viên
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Hỗ trợ cấp tài khoản học vụ, hướng dẫn sử dụng phòng học trực tuyến và cấu hình Trợ lý học tập.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
              <div className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <School
                  className="w-[18px] h-[18px] text-[var(--accent)] shrink-0"
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted)]">Đơn vị quản lý</p>
                  <p className="font-sans font-semibold text-[var(--text)] truncate">{tenTruong}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <Mail
                  className="w-[18px] h-[18px] text-[var(--accent)] shrink-0"
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted)]">Thư điện tử</p>
                  <a
                    href={`mailto:${emailLienHe}`}
                    className="font-mono font-medium text-[var(--accent)] hover:underline truncate block text-xs"
                  >
                    {emailLienHe}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <Phone
                  className="w-[18px] h-[18px] text-[var(--accent)] shrink-0"
                  strokeWidth={1.75}
                />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted)]">Điện thoại trực ban</p>
                  <p className="font-mono font-medium text-[var(--text)] tabular-nums">
                    {soDienThoai}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-5 px-4 text-xs text-[var(--muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-sans font-medium text-[var(--text)]">
            {tenHeThong} — {maLopKhoa} — {tacGia} ({mssv})
          </p>
          <p>Bản quyền © 2026 {tenTruong}.</p>
        </div>
      </footer>
    </div>
  );
}
