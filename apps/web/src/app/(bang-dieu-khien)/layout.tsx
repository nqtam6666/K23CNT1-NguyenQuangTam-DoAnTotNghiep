'use client';

import { ReactNode, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  Menu,
  X,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Moon,
  Sun,
  Globe,
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

const BAN_DO_TIEU_DE_TRANG: Record<string, string> = {
  '/bang-dieu-khien': 'Tổng quan',
  '/nguoi-dung': 'Quản lý người dùng',
  '/ho-so': 'Hồ sơ cá nhân',
  '/hoc-vu': 'Học vụ và đào tạo',
  '/lop-hoc-phan': 'Lớp học phần',
  '/thoi-khoa-bieu': 'Thời khóa biểu',
  '/cai-dat': 'Cài đặt hệ thống',
  '/phu-huynh/con-em': 'Con em của tôi',
  '/gioi-thieu': 'Giới thiệu hệ thống',
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
  const [sidebarMo, setSidebarMo] = useState(false);
  const [thuGon, setThuGon] = useState(false);
  const [timKiemMo, setTimKiemMo] = useState(false);
  const [cheDoSangToi, setCheDoSangToi] = useState<'sang' | 'toi'>('sang');

  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'LMS Trường Học');
  const moTaPhu = `${layGiaTri('MA_LOP_KHOA', 'K23CNT1')} ${layGiaTri('TAC_GIA', 'Quang Tâm')}`;
  const urlLogo = layGiaTri('URL_LOGO');
  const urlFavicon = layGiaTri('URL_FAVICON', '/favicon.ico');
  const urlIcon = layGiaTri('URL_ICON');

  // Cập nhật Favicon động theo cấu hình hệ thống
  useEffect(() => {
    if (typeof window !== 'undefined' && urlFavicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = urlFavicon;
    }
  }, [urlFavicon]);

  // Đọc trạng thái giao diện Sáng / Tối đã lưu từ localStorage khi tải trang
  useEffect(() => {
    try {
      const trangThaiLuu = localStorage.getItem('lms_theme');
      const heThongToi = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const laToi = trangThaiLuu === 'toi' || (!trangThaiLuu && heThongToi);
      if (laToi) {
        document.documentElement.classList.add('dark');
        setCheDoSangToi('toi');
      } else {
        document.documentElement.classList.remove('dark');
        setCheDoSangToi('sang');
      }
    } catch {
      // Bỏ qua nếu môi trường không cho phép truy cập localStorage
    }
  }, []);

  // Đọc trạng thái thu gọn đã lưu từ localStorage khi tải trang
  useEffect(() => {
    try {
      const trangThaiLuu = localStorage.getItem('lms_sidebar_thu_gon');
      if (trangThaiLuu !== null) {
        setThuGon(trangThaiLuu === 'true');
      }
    } catch {
      // Bỏ qua nếu môi trường không cho phép truy cập localStorage
    }
  }, []);

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

  // Lấy hồ sơ người dùng từ API
  const {
    data: nguoiDung,
    isError,
    isLoading,
  } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu || res.data;
    },
    staleTime: 30 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.push('/dang-nhap');
    }
  }, [isError, router]);

  // Kiểm soát truy cập trực tiếp bằng URL (Route Guard chống bypass)
  useEffect(() => {
    if (!nguoiDung || isLoading) return;

    const vaiTro = nguoiDung.vaiTro;

    // Chặn quản trị viên và các vai trò khác vào mục con em của phụ huynh
    if (pathname.startsWith('/phu-huynh/con-em') && vaiTro !== VaiTro.PHU_HUYNH) {
      router.replace('/khong-co-quyen');
      return;
    }

    // Chặn tài khoản không phải quản trị viên vào trang cài đặt
    if (pathname.startsWith('/cai-dat') && vaiTro !== VaiTro.QUAN_TRI_VIEN) {
      router.replace('/khong-co-quyen');
      return;
    }

    // Chặn tài khoản không có quyền quản lý người dùng
    if (
      pathname.startsWith('/nguoi-dung') &&
      vaiTro !== VaiTro.QUAN_TRI_VIEN &&
      vaiTro !== VaiTro.GIAO_VU
    ) {
      router.replace('/khong-co-quyen');
      return;
    }

    // Chặn tài khoản không có quyền học vụ
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

  const dangXuat = async () => {
    try {
      await mayKhachApi.post('/xac-thuc/dang-xuat');
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      queryClient.clear();
      thongBao.thanhCong('Đã đăng xuất', 'Hẹn gặp lại bạn!');
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
    };

    menuTheoVaiTro.forEach((item) => {
      if (nhomDanhSach[item.nhom]) {
        nhomDanhSach[item.nhom].push(item);
      }
    });

    return nhomDanhSach;
  }, [menuTheoVaiTro]);

  const thuTuNhom: NhomMenu[] = ['CA_NHAN', 'HOC_TAP', 'QUAN_TRI'];

  const batTatSangToi = () => {
    const tiepTheo = cheDoSangToi === 'sang' ? 'toi' : 'sang';

    const thucHienDoiGiaoDien = () => {
      if (tiepTheo === 'toi') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setCheDoSangToi(tiepTheo);
      try {
        localStorage.setItem('lms_theme', tiepTheo);
      } catch {
        // Bỏ qua lỗi ghi localStorage
      }
    };

    // Tích hợp View Transitions API với hiệu ứng circle-blur-top-left chuẩn https://theme-toggle.rdsx.dev/
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        thucHienDoiGiaoDien();
      });
    } else {
      thucHienDoiGiaoDien();
    }

    thongBao.thanhCong(
      tiepTheo === 'toi' ? 'Chế độ tối' : 'Chế độ sáng',
      'Đã cập nhật giao diện hiển thị',
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden dark:bg-slate-950 dark:text-slate-100">
      {/* 1. Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shrink-0 select-none ${
          thuGon ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header của Sidebar */}
        <div
          className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ${
            thuGon ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link
            href="/bang-dieu-khien"
            className="flex items-center gap-2.5 min-w-0 group"
            title={tenHeThong}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              {thuGon && urlIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlIcon} alt="Icon" className="w-full h-full object-contain p-1" />
              ) : urlLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlLogo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            {!thuGon && (
              <div className="truncate transition-opacity duration-200">
                <h1 className="font-bold text-slate-900 dark:text-white leading-tight truncate text-sm">
                  {tenHeThong}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{moTaPhu}</p>
              </div>
            )}
          </Link>

          {!thuGon && (
            <button
              onClick={batTatThuGon}
              title="Thu gọn thanh bên (Ctrl+B)"
              aria-label="Thu gọn thanh bên"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Danh sách nhóm Menu Navigation */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden">
          {isLoading || !nguoiDung ? (
            <div className="space-y-2 py-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2.5 rounded-xl animate-pulse bg-slate-100/70 ${
                    thuGon ? 'justify-center' : ''
                  }`}
                >
                  <div className="w-5 h-5 rounded-md bg-slate-200 shrink-0" />
                  {!thuGon && (
                    <div
                      className="h-3.5 bg-slate-200 rounded"
                      style={{ width: `${55 + (i % 3) * 18}%` }}
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
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {NHOM_MENU_INFO[maNhom].tenNhom}
                    </div>
                  )}

                  {thuGon && <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2" />}

                  {danhSachNhom.map((item) => {
                    const BieuTuong = item.bieuTuong;
                    const laTrangHienTai =
                      pathname === item.duongDan ||
                      (item.duongDan !== '/bang-dieu-khien' && pathname.startsWith(item.duongDan));

                    return (
                      <Link
                        key={item.id}
                        href={item.duongDan}
                        prefetch={true}
                        title={thuGon ? item.tieuDe : undefined}
                        className={`group relative flex items-center rounded-xl text-sm font-medium transition-all duration-150 select-none cursor-pointer ${
                          thuGon ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
                        } ${
                          laTrangHienTai
                            ? 'bg-blue-50/90 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 hover:translate-x-0.5'
                        }`}
                      >
                        {laTrangHienTai && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-xs shadow-blue-500/50" />
                        )}
                        <BieuTuong
                          className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            laTrangHienTai ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                          }`}
                        />
                        {!thuGon && <span className="truncate">{item.tieuDe}</span>}
                        {!thuGon && item.huyHieu && (
                          <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                            {item.huyHieu}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })
          )}
        </nav>

        {/* Chân Sidebar: Thông tin người dùng và Đăng xuất */}
        <div
          className={`p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 transition-all ${
            thuGon ? 'flex flex-col items-center gap-2' : ''
          }`}
        >
          {isLoading || !nguoiDung ? (
            <div
              className={`flex items-center gap-2.5 min-w-0 animate-pulse ${
                thuGon ? 'justify-center' : 'flex-1'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
              {!thuGon && (
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                </div>
              )}
            </div>
          ) : thuGon ? (
            <div className="flex flex-col items-center gap-2.5 py-1">
              <div
                title={`${nguoiDung.hoTen} (${layNhanVaiTro(nguoiDung.vaiTro)})`}
                className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0 cursor-default ring-2 ring-white dark:ring-slate-800 shadow-2xs"
              >
                {nguoiDung.hoTen?.charAt(0) || 'U'}
              </div>
              <button
                onClick={dangXuat}
                disabled={isLoading}
                title="Đăng xuất"
                aria-label="Đăng xuất tài khoản"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Link href="/ho-so" className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
                  {nguoiDung.hoTen?.charAt(0) || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {nguoiDung.hoTen}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-medium">
                    {layNhanVaiTro(nguoiDung.vaiTro)}
                  </span>
                </div>
              </Link>
              <button
                onClick={dangXuat}
                disabled={isLoading}
                title="Đăng xuất"
                aria-label="Đăng xuất tài khoản"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Mobile Drawer */}
      {sidebarMo && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setSidebarMo(false)}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs overflow-hidden">
                  {urlLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlLogo} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 text-sm">{tenHeThong}</h1>
                  <p className="text-[10px] text-slate-500">{moTaPhu}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarMo(false)}
                aria-label="Đóng menu điện thoại"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3.5 space-y-3 overflow-y-auto">
              {thuTuNhom.map((maNhom) => {
                const danhSachNhom = menuTheoNhom[maNhom];
                if (danhSachNhom.length === 0) return null;

                return (
                  <div key={maNhom} className="space-y-1">
                    <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {NHOM_MENU_INFO[maNhom].tenNhom}
                    </div>

                    {danhSachNhom.map((item) => {
                      const BieuTuong = item.bieuTuong;
                      const laTrangHienTai =
                        pathname === item.duongDan ||
                        (item.duongDan !== '/bang-dieu-khien' && pathname.startsWith(item.duongDan));

                      return (
                        <Link
                          key={item.id}
                          href={item.duongDan}
                          onClick={() => setSidebarMo(false)}
                          prefetch={true}
                          className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all select-none ${
                            laTrangHienTai
                              ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {laTrangHienTai && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                          )}
                          <BieuTuong
                            className={`w-4 h-4 ${laTrangHienTai ? 'text-blue-600' : 'text-slate-400'}`}
                          />
                          <span>{item.tieuDe}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs shrink-0">
                    {nguoiDung?.hoTen?.charAt(0) || 'U'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {nguoiDung?.hoTen}
                    </p>
                    <span className="text-[10px] text-blue-600 font-medium">
                      {layNhanVaiTro(nguoiDung?.vaiTro as VaiTro)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={dangXuat}
                  disabled={isLoading}
                  aria-label="Đăng xuất tài khoản"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Vùng nội dung chính & Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút bật/tắt drawer trên Mobile */}
            <button
              onClick={() => setSidebarMo(!sidebarMo)}
              title="Menu điều hướng"
              aria-label="Mở menu điện thoại"
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Nút Toggle thu gọn/mở rộng thanh bên Desktop */}
            <button
              onClick={batTatThuGon}
              title={thuGon ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)'}
              aria-label={thuGon ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              className="hidden md:inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-lg cursor-pointer transition-all"
            >
              {thuGon ? (
                <PanelLeftOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            {/* Breadcrumb đường dẫn */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 pl-1">
              <span>Bảng điều khiển</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{layTieuDeTrang(pathname)}</span>
            </div>
          </div>

          {/* Nhóm công cụ phía phải Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút tìm kiếm nhanh Command Palette (Ctrl+K) */}
            <button
              onClick={() => setTimKiemMo(true)}
              title="Tìm kiếm nhanh toàn hệ thống (Ctrl+K)"
              aria-label="Tìm kiếm nhanh (Ctrl+K)"
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Tìm kiếm...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded shadow-2xs">
                Ctrl+K
              </kbd>
            </button>

            {/* Chỉ báo sức khỏe hệ thống (CHỈ HIỂN THỊ CHO QUẢN TRỊ VIÊN) */}
            <ChiBaoSucKhoe vaiTroNguoiDung={nguoiDung?.vaiTro} />

            {/* Bộ dịch ngôn ngữ đa quốc gia GTranslate */}
            <DichNgonNgu />

            {/* Nút chế độ Sáng / Tối */}
            <button
              onClick={batTatSangToi}
              data-testid="nut-che-do-sang-toi"
              title={cheDoSangToi === 'sang' ? 'Chuyển sang Chế độ tối' : 'Chuyển sang Chế độ sáng'}
              aria-label="Chuyển đổi giao diện sáng tối"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-90"
            >
              {cheDoSangToi === 'sang' ? (
                <Moon className="w-4 h-4 text-slate-600 hover:text-indigo-600 transition-colors" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div key={pathname} className="max-w-7xl mx-auto hieu-ung-chuyen-trang">
            {children}
          </div>
        </main>
      </div>

      {/* 4. Modal tìm kiếm nhanh Command Palette */}
      <TimKiemNhanh
        vaiTroNguoiDung={nguoiDung?.vaiTro}
        dangMo={timKiemMo}
        onDong={() => setTimKiemMo(false)}
      />
    </div>
  );
}
