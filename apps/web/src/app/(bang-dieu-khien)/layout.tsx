'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  School,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
} from 'lucide-react';
import { mayKhachApi } from '../../tien-ich/may-khach-api';
import { thongBao } from '../../tien-ich/thong-bao';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PayloadJwt, VaiTro, layNhanVaiTro } from '@lms/chung';
import { useCaiDatHeThong } from '../../tien-ich/use-cai-dat';
import {
  locMenuTheoVaiTro,
  MucMenuCauHinh,
  NHOM_MENU_INFO,
  NhomMenu,
} from '../../cau-hinh/menu.cau-hinh';
import { ChiBaoSucKhoe } from '../../thanh-phan/chi-bao-suc-khoe';
import { TimKiemNhanh } from '../../thanh-phan/tim-kiem-nhanh';
import { DichNgonNgu } from '../../thanh-phan/dich-ngon-ngu';
import { ToggleTheme } from '@/components/ui/toggle-theme';
import { AnhDaiDien } from '../../thanh-phan/anh-dai-dien';
import { MucThanhBen } from '../../thanh-phan/muc-thanh-ben';
import { HopThoai } from '../../thanh-phan/hop-thoai';
import { NutBam } from '../../thanh-phan/nut-bam';
import {
  HopThoaiThongBaoHeThong,
  useThongBaoThucTe,
} from '../../thanh-phan/hop-thong-bao';

const BAN_DO_TIEU_DE_TRANG: Record<string, string> = {
  '/bang-dieu-khien': 'Tổng quan',
  '/nguoi-dung': 'Quản lý người dùng',
  '/ho-so': 'Hồ sơ cá nhân',
  '/hoc-vu': 'Học vụ và đào tạo',
  '/lop-hoc-phan': 'Lớp học phần',
  '/thoi-khoa-bieu': 'Thời khóa biểu',
  '/tro-ly-ai': 'Trợ lý học tập AI',
  '/cai-dat': 'Cài đặt hệ thống',
  '/phu-huynh/con-em': 'Con em của tôi',
  '/gioi-thieu': 'Giới thiệu hệ thống',
  '/bao-loi-dong-gop': 'Báo lỗi & Đóng góp',
  '/khong-co-quyen': 'Không có quyền truy cập',
};

function layTieuDeTrang(duongDan: string): string {
  if (BAN_DO_TIEU_DE_TRANG[duongDan]) return BAN_DO_TIEU_DE_TRANG[duongDan];
  for (const [key, value] of Object.entries(BAN_DO_TIEU_DE_TRANG)) {
    if (key !== '/bang-dieu-khien' && duongDan.startsWith(key)) {
      return value;
    }
  }
  return 'Tổng quan';
}

export default function LayoutBangDieuKhien({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [thuGon, setThuGon] = useState(false);
  const [timKiemMo, setTimKiemMo] = useState(false);
  const [thongBaoHeThongMo, setThongBaoHeThongMo] = useState(false);
  const [xacNhanDangXuatMo, setXacNhanDangXuatMo] = useState(false);
  const [dangXuLyDangXuat, setDangXuLyDangXuat] = useState(false);
  const [dangChuyenVaiTro, setDangChuyenVaiTro] = useState(false);
  const [cheDoSangToi, setCheDoSangToi] = useState<'sang' | 'toi'>('sang');

  const chuyenNhanhTaiKhoan = async (emailMoi: string, nhanVaiTro: string) => {
    if (!emailMoi || emailMoi === nguoiDung?.email || dangChuyenVaiTro) return;
    setDangChuyenVaiTro(true);
    try {
      const phanHoi = await mayKhachApi.post('/xac-thuc/dang-nhap', {
        email: emailMoi,
        matKhau: 'MatKhau@123',
      });
      const nguoiDungMoi = phanHoi.data?.duLieu?.nguoiDung || phanHoi.data?.nguoiDung;
      try {
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
        localStorage.removeItem('lms_cache_bang_dieu_khien');
        if (nguoiDungMoi) {
          const chuoi = JSON.stringify(nguoiDungMoi);
          sessionStorage.setItem('lms_cache_ho_so', chuoi);
          localStorage.setItem('lms_cache_ho_so', chuoi);
        }
      } catch {
        // Bỏ qua
      }
      queryClient.clear();
      thongBao.thanhCong(`Đã chuyển sang ${nhanVaiTro}`, `Tài khoản: ${emailMoi}`);
      window.location.href = '/bang-dieu-khien';
    } catch {
      thongBao.thatBai('Không thể chuyển vai trò', 'Vui lòng thử lại.');
      setDangChuyenVaiTro(false);
    }
  };

  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const moTaPhu = `${layGiaTri('MA_LOP_KHOA', 'K23CNT1')} · ${layGiaTri('TAC_GIA', 'Quang Tâm')}`;
  const urlLogo = layGiaTri('URL_LOGO');
  const urlIcon = layGiaTri('URL_ICON');
  const thuGonThanhBenMacDinh =
    layGiaTri('giao_dien.thu_gon_thanh_ben_mac_dinh', 'false') === 'true';
  const choPhepDoiCheDoSangToi =
    layGiaTri('giao_dien.cho_phep_doi_che_do_sang_toi', 'true') !== 'false';
  const hienThiChiBaoSucKhoe =
    layGiaTri('giao_dien.hien_thi_chi_bao_suc_khoe_he_thong', 'true') !== 'false';

  // Đọc trạng thái giao diện Sáng / Tối đã lưu từ localStorage khi tải trang
  useEffect(() => {
    try {
      const trangThaiLuu = localStorage.getItem('lms_theme');
      const heThongToi = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const laToi =
        trangThaiLuu === 'toi' ||
        trangThaiLuu === 'dark' ||
        (!trangThaiLuu && heThongToi);
      if (laToi) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        setCheDoSangToi('toi');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        setCheDoSangToi('sang');
      }
    } catch {
      // Bỏ qua nếu môi trường không cho phép truy cập localStorage
    }
  }, []);

  // Đọc trạng thái thu gọn đã lưu từ localStorage hoặc mặc định từ cài đặt hệ thống
  useEffect(() => {
    try {
      const trangThaiLuu = localStorage.getItem('lms_sidebar_thu_gon');
      if (trangThaiLuu !== null) {
        setThuGon(trangThaiLuu === 'true');
      } else {
        setThuGon(thuGonThanhBenMacDinh);
      }
    } catch {
      // Bỏ qua nếu môi trường không cho phép truy cập localStorage
    }
  }, [thuGonThanhBenMacDinh]);

  const batTatThuGon = () => {
    setThuGon((prev) => {
      const trangThaiMoi = !prev;
      try {
        localStorage.setItem('lms_sidebar_thu_gon', String(trangThaiMoi));
      } catch {
        // Bỏ qua lỗi ghi localStorage
      }
      return trangThaiMoi;
    });
  };

  // Phím tắt bàn phím: Ctrl+B (thu gọn sidebar) và Ctrl+K (tìm kiếm nhanh)
  useEffect(() => {
    const xuLyPhimTat = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        batTatThuGon();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setTimKiemMo((prev) => !prev);
      }
    };
    window.addEventListener('keydown', xuLyPhimTat);
    return () => window.removeEventListener('keydown', xuLyPhimTat);
  }, []);

  // Khôi phục nhanh hồ sơ từ sessionStorage / localStorage ngay sau khi hydrate để tránh lỗi Hydration #418
  useEffect(() => {
    try {
      const raw =
        sessionStorage.getItem('lms_cache_ho_so') || localStorage.getItem('lms_cache_ho_so');
      if (raw && !queryClient.getQueryData(['ho-so-hien-tai'])) {
        queryClient.setQueryData(['ho-so-hien-tai'], JSON.parse(raw) as PayloadJwt, {
          updatedAt: 0,
        });
      }
    } catch {
      // Bỏ qua lỗi đọc bộ nhớ trình duyệt
    }
  }, [queryClient]);

  // Lấy hồ sơ người dùng từ API
  const {
    data: nguoiDung,
    isError,
    error: loiHoSo,
    isLoading,
  } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      const duLieu = res.data?.duLieu || res.data;
      try {
        const chuoiHoSo = JSON.stringify(duLieu);
        sessionStorage.setItem('lms_cache_ho_so', chuoiHoSo);
        localStorage.setItem('lms_cache_ho_so', chuoiHoSo);
      } catch {
        // Bỏ qua lỗi ghi bộ nhớ trình duyệt
      }
      return duLieu;
    },
    staleTime: 15 * 1000,
    retry: (soLanThu, loi: any) => {
      // Không thử lại nếu là lỗi 401 (đã qua interceptor làm mới token mà vẫn thất bại)
      if (loi?.response?.status === 401) return false;
      // Thử lại tối đa 3 lần nếu máy chủ API đang khởi động lại khi build
      return soLanThu < 3;
    },
    retryDelay: 1000,
  });

  const { tongSoChuaDoc } = useThongBaoThucTe(Boolean(nguoiDung));

  useEffect(() => {
    const maTrangThai = (loiHoSo as any)?.response?.status;
    if (isError && maTrangThai === 401) {
      try {
        sessionStorage.removeItem('lms_cache_ho_so');
        sessionStorage.removeItem('lms_cache_bang_dieu_khien');
        localStorage.removeItem('lms_cache_ho_so');
        localStorage.removeItem('lms_cache_bang_dieu_khien');
      } catch {
        // Bỏ qua
      }
      router.push('/dang-nhap');
    }
  }, [isError, loiHoSo, router]);

  // Kiểm soát truy cập trực tiếp bằng URL (Route Guard chống bypass)
  useEffect(() => {
    if (!nguoiDung || isLoading) return;

    const vaiTro = nguoiDung.vaiTro;

    if (pathname.startsWith('/phu-huynh/con-em') && vaiTro !== VaiTro.PHU_HUYNH) {
      router.replace('/khong-co-quyen');
      return;
    }

    if (pathname.startsWith('/cai-dat') && vaiTro !== VaiTro.QUAN_TRI_VIEN) {
      router.replace('/khong-co-quyen');
      return;
    }

    if (
      pathname.startsWith('/nguoi-dung') &&
      vaiTro !== VaiTro.QUAN_TRI_VIEN &&
      vaiTro !== VaiTro.GIAO_VU
    ) {
      router.replace('/khong-co-quyen');
      return;
    }

    if (
      pathname.startsWith('/hoc-vu') &&
      vaiTro !== VaiTro.QUAN_TRI_VIEN &&
      vaiTro !== VaiTro.BAN_GIAM_HIEU &&
      vaiTro !== VaiTro.GIAO_VU
    ) {
      router.replace('/khong-co-quyen');
      return;
    }
  }, [pathname, nguoiDung, isLoading, router]);

  const thucHienDangXuat = async () => {
    setDangXuLyDangXuat(true);
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
      setXacNhanDangXuatMo(false);
      thongBao.thanhCong('Đã đăng xuất', 'Hẹn gặp lại bạn.');
      setTimeout(() => {
        window.location.href = '/dang-nhap';
      }, 350);
    }
  };

  // Danh mục menu lọc theo vai trò
  const menuTheoVaiTro = useMemo(() => {
    if (!nguoiDung) return [];
    return locMenuTheoVaiTro(nguoiDung.vaiTro);
  }, [nguoiDung]);

  // Gom nhóm menu
  const menuTheoNhom = useMemo(() => {
    const nhomDanhSach: Record<NhomMenu, MucMenuCauHinh[]> = {
      CA_NHAN: [],
      HOC_TAP: [],
      QUAN_TRI: [],
      TRO_GIUP: [],
    };

    menuTheoVaiTro.forEach((item) => {
      if (nhomDanhSach[item.nhom]) {
        nhomDanhSach[item.nhom].push(item);
      }
    });

    return nhomDanhSach;
  }, [menuTheoVaiTro]);

  const thuTuNhom: NhomMenu[] = ['CA_NHAN', 'HOC_TAP', 'QUAN_TRI', 'TRO_GIUP'];

  const duongDanActive = useMemo(() => {
    const khop = menuTheoVaiTro.find(
      (item) =>
        pathname === item.duongDan ||
        (item.duongDan !== '/bang-dieu-khien' && pathname.startsWith(item.duongDan)),
    );
    return khop?.duongDan;
  }, [menuTheoVaiTro, pathname]);

  const batTatSangToi = () => {
    const tiepTheo = cheDoSangToi === 'sang' ? 'toi' : 'sang';

    const thucHienDoiGiaoDien = () => {
      if (tiepTheo === 'toi') {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      setCheDoSangToi(tiepTheo);
      try {
        localStorage.setItem('lms_theme', tiepTheo);
      } catch {
        // Bỏ qua lỗi ghi localStorage
      }
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(
        () => {
          flushSync(() => {
            thucHienDoiGiaoDien();
          });
        },
      );
    } else {
      thucHienDoiGiaoDien();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* 1. Sidebar trái cố định: 240px trên >=720px, thu về 64px chỉ còn icon khi <720px hoặc khi thuGon=true */}
      <aside
        aria-label="Thanh điều hướng chính"
        className={`flex flex-col bg-[var(--surface)] border-r border-[var(--border)] transition-[width] duration-150 ease-out shrink-0 select-none ${
          thuGon ? 'w-[64px]' : 'w-[64px] md:w-[252px]'
        }`}
      >
        {/* Header của Sidebar */}
        <div
          className={`h-16 flex items-center border-b border-[var(--border)] ${
            thuGon
              ? 'justify-center px-2'
              : 'justify-center px-2 md:justify-start md:px-[18px]'
          }`}
        >
          <Link
            href="/bang-dieu-khien"
            className="flex items-center gap-2.5 min-w-0 group"
            title={tenHeThong}
            aria-label={tenHeThong}
          >
            <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0 overflow-hidden">
              {urlLogo || urlIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlLogo || urlIcon} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <School strokeWidth={1.5} className="w-5 h-5" />
              )}
            </div>
            {!thuGon && (
              <div className="hidden md:block truncate">
                <p className="font-sans font-semibold text-[var(--text)] leading-tight truncate text-[14px]">
                  {tenHeThong}
                </p>
                <p className="font-sans text-[11px] text-[var(--muted)] truncate">{moTaPhu}</p>
              </div>
            )}
          </Link>
        </div>

        {/* Danh sách nhóm Menu Navigation */}
        <nav
          aria-label="Danh mục chức năng"
          className="flex-1 py-3 px-2.5 space-y-4 overflow-y-auto overflow-x-hidden"
        >
          {isLoading || !nguoiDung ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius)] animate-pulse bg-[var(--active-bg)] ${
                    thuGon ? 'justify-center' : 'justify-center md:justify-start'
                  }`}
                >
                  <div className="w-[18px] h-[18px] rounded-[var(--radius)] bg-[var(--border)] shrink-0" />
                  {!thuGon && (
                    <div
                      className="hidden md:block h-3 bg-[var(--border)] rounded-[var(--radius)]"
                      style={{ width: `${50 + (i % 3) * 15}%` }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            thuTuNhom.map((maNhom) => {
              const danhSachNhom = menuTheoNhom[maNhom];
              if (danhSachNhom.length === 0) return null;

              return (
                <div key={maNhom} className="space-y-1">
                  {!thuGon && (
                    <div className="hidden md:block px-3 pt-1 pb-1 text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--muted)]">
                      {NHOM_MENU_INFO[maNhom].tenNhom}
                    </div>
                  )}

                  {thuGon && <div className="h-px bg-[var(--border)] my-1.5 mx-1" />}

                  <div className="space-y-0.5">
                    {danhSachNhom.map((item) => {
                      const laTrangHienTai = item.duongDan === duongDanActive;

                      return (
                        <MucThanhBen
                          key={item.id}
                          href={item.duongDan}
                          icon={item.bieuTuong}
                          active={laTrangHienTai}
                          thuGon={thuGon}
                          title={item.tieuDe}
                          huyHieu={item.huyHieu !== undefined ? String(item.huyHieu) : undefined}
                        >
                          {item.tieuDe}
                        </MucThanhBen>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </nav>

        {/* Chân Sidebar: Ngăn cách bằng đường kẻ 1px, Thông tin cá nhân + Mục Đăng xuất (Danger) */}
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-2.5 space-y-1.5">
          {!isLoading && nguoiDung && (
            <Link
              href="/ho-so"
              title={`${nguoiDung.hoTen} (${layNhanVaiTro(nguoiDung.vaiTro)})`}
              aria-label={`Hồ sơ của ${nguoiDung.hoTen}`}
              className={`flex items-center rounded-[var(--radius)] bg-[var(--bg)] hover:bg-[var(--active-bg)] border border-[var(--border)] transition-colors py-2 ${
                thuGon ? 'justify-center px-0' : 'justify-center px-0 md:justify-start md:gap-2.5 md:px-3'
              }`}
            >
              <AnhDaiDien
                url={nguoiDung.anhDaiDien}
                hoTen={nguoiDung.hoTen}
                kichThuoc="sm"
                hienThiVien
              />
              {!thuGon && (
                <div className="hidden md:block truncate min-w-0">
                  <p className="font-sans text-xs font-semibold text-[var(--text)] truncate">
                    {nguoiDung.hoTen}
                  </p>
                  <span className="font-sans text-[11px] text-[var(--accent)] font-medium">
                    {layNhanVaiTro(nguoiDung.vaiTro)}
                  </span>
                </div>
              )}
            </Link>
          )}

          {/* Mục Danger (Đăng xuất) */}
          <MucThanhBen
            icon={LogOut}
            danger
            thuGon={thuGon}
            disabled={isLoading || dangXuLyDangXuat}
            onClick={() => setXacNhanDangXuatMo(true)}
            title="Đăng xuất tài khoản"
          >
            Đăng xuất
          </MucThanhBen>
        </div>
      </aside>

      {/* 2. Vùng nội dung chính & Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            {/* Nút Toggle thu gọn/mở rộng thanh bên trên màn hình >=720px */}
            <button
              type="button"
              onClick={batTatThuGon}
              title={thuGon ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)'}
              aria-label={thuGon ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              className="hidden md:inline-flex items-center justify-center p-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)] rounded-[var(--radius)] cursor-pointer transition-colors shrink-0"
            >
              {thuGon ? (
                <PanelLeftOpen strokeWidth={1.75} className="w-[18px] h-[18px] text-[var(--accent)]" />
              ) : (
                <PanelLeftClose strokeWidth={1.75} className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* Breadcrumb đường dẫn */}
            <nav
              aria-label="Đường dẫn trang"
              className="flex items-center gap-2 font-sans text-xs sm:text-sm text-[var(--muted)] min-w-0"
            >
              <Link
                href="/"
                className="hidden lg:inline whitespace-nowrap text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors"
                title="Về Trang chủ cổng thông tin"
              >
                Trang chủ
              </Link>
              <span className="hidden lg:inline text-[var(--border)] select-none">/</span>
              <span className="font-sans font-semibold text-[var(--text)] whitespace-nowrap truncate">
                {layTieuDeTrang(pathname)}
              </span>
            </nav>
          </div>

          {/* Nhóm công cụ phía phải Header */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bộ chuyển nhanh vai trò trải nghiệm 1 chạm */}
            {nguoiDung && (
              <select
                aria-label="Chuyển nhanh vai trò tài khoản"
                disabled={dangChuyenVaiTro}
                value={nguoiDung.email}
                onChange={(e) => {
                  const muc = e.target.options[e.target.selectedIndex];
                  chuyenNhanhTaiKhoan(e.target.value, muc?.text || 'Tài khoản');
                }}
                title="Chuyển nhanh vai trò (Quản trị viên / Giảng viên / Sinh viên / Giáo vụ)"
                className="hidden md:inline-block px-2.5 py-1.5 font-sans text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="admin@lms.edu.vn">Vai trò: Quản trị viên</option>
                <option value="giaovien1@lms.edu.vn">Vai trò: Giảng viên</option>
                <option value="hocsinh1@lms.edu.vn">Vai trò: Sinh viên</option>
                <option value="giaovu@lms.edu.vn">Vai trò: Giáo vụ</option>
                <option value="phuhuynh1@lms.edu.vn">Vai trò: Phụ huynh</option>
              </select>
            )}

            {/* Nút tìm kiếm nhanh Command Palette (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setTimKiemMo(true)}
              title="Tìm kiếm nhanh toàn hệ thống (Ctrl+K)"
              aria-label="Tìm kiếm nhanh (Ctrl+K)"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 font-sans text-xs text-[var(--muted)] hover:text-[var(--text)] bg-[var(--bg)] hover:bg-[var(--active-bg)] border border-[var(--border)] rounded-[var(--radius)] transition-colors cursor-pointer shrink-0"
            >
              <Search strokeWidth={1.75} className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Tìm kiếm nhanh...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] rounded-[var(--radius)] whitespace-nowrap">
                Ctrl+K
              </kbd>
            </button>

            {/* Nút mở Modal thông báo học vụ thực tế (hiển thị số lượng chưa đọc) */}
            <button
              type="button"
              onClick={() => setThongBaoHeThongMo(true)}
              title={
                tongSoChuaDoc > 0
                  ? `Xem thông báo học vụ (${tongSoChuaDoc} chưa đọc)`
                  : 'Xem thông báo học vụ'
              }
              aria-label="Xem thông báo học vụ"
              className="relative inline-flex items-center justify-center p-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer shrink-0"
            >
              <Bell strokeWidth={1.5} className="w-[18px] h-[18px]" />
              {tongSoChuaDoc > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--danger)] text-white font-mono text-[10px] font-bold leading-none flex items-center justify-center tabular-nums border border-[var(--surface)]">
                  {tongSoChuaDoc > 99 ? '99+' : tongSoChuaDoc}
                </span>
              )}
            </button>

            {/* Chỉ báo sức khỏe hệ thống (CHỈ HIỂN THỊ CHO QUẢN TRỊ VIÊN KHI BẬT CÀI ĐẶT) */}
            {hienThiChiBaoSucKhoe && <ChiBaoSucKhoe vaiTroNguoiDung={nguoiDung?.vaiTro} />}

            {/* Bộ dịch ngôn ngữ đa quốc gia GTranslate */}
            <DichNgonNgu />

            {/* Bộ chuyển đổi giao diện Hệ thống / Sáng / Tối */}
            {choPhepDoiCheDoSangToi && <ToggleTheme />}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[var(--bg)]">
          <div key={pathname} className="max-w-7xl mx-auto hieu-ung-chuyen-trang">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Modal tìm kiếm nhanh Command Palette */}
      <TimKiemNhanh
        vaiTroNguoiDung={nguoiDung?.vaiTro}
        dangMo={timKiemMo}
        onDong={() => setTimKiemMo(false)}
      />

      {/* 4. Modal thông báo hệ thống ("Tắt trong 24h" & "Đã hiểu") */}
      <HopThoaiThongBaoHeThong
        moChuDong={thongBaoHeThongMo}
        onDongChuDong={() => setThongBaoHeThongMo(false)}
        tuDongHienThi={true}
      />

      {/* 5. Modal xác nhận trước khi Đăng xuất (nút danger) */}
      <HopThoai
        mo={xacNhanDangXuatMo}
        onDong={() => setXacNhanDangXuatMo(false)}
        eyebrow="XÁC NHẬN PHIÊN LÀM VIỆC"
        tieuDe="Đăng xuất khỏi hệ thống?"
        moTa="Phiên làm việc hiện tại của bạn sẽ kết thúc. Bạn có thể đăng nhập lại bất cứ lúc nào."
        kichThuoc="nho"
      >
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <NutBam
            variant="secondary"
            type="button"
            onClick={() => setXacNhanDangXuatMo(false)}
            disabled={dangXuLyDangXuat}
          >
            Hủy bỏ
          </NutBam>
          <NutBam
            variant="danger"
            type="button"
            dangTai={dangXuLyDangXuat}
            onClick={thucHienDangXuat}
          >
            Đăng xuất
          </NutBam>
        </div>
      </HopThoai>
    </div>
  );
}
