'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Video,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import { mayKhachApi } from '../../tien-ich/may-khach-api';
import { thongBao } from '../../tien-ich/thong-bao';
import { useQuery } from '@tanstack/react-query';
import { PayloadJwt, VaiTro } from '@lms/chung';

export default function LayoutBangDieuKhien({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarMo, setSidebarMo] = useState(false);

  // Lấy hồ sơ người dùng từ React Query Cache (staleTime 5 phút, không fetch thừa khi chuyển trang)
  const { data: nguoiDung, isError } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      router.push('/dang-nhap');
    }
  }, [isError, router]);

  const dangXuat = async () => {
    try {
      await mayKhachApi.post('/xac-thuc/dang-xuat');
      thongBao.thanhCong('Đã đăng xuất', 'Hẹn gặp lại bạn!');
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      router.push('/dang-nhap');
    }
  };

  const danhMucMenu = [
    {
      tieuDe: 'Tổng quan',
      duongDan: '/bang-dieu-khien',
      bieuTuong: BookOpen,
      vaiTroChoPhep: [
        VaiTro.QUAN_TRI_VIEN,
        VaiTro.BAN_GIAM_HIEU,
        VaiTro.GIAO_VU,
        VaiTro.GIAO_VIEN,
        VaiTro.HOC_SINH,
        VaiTro.PHU_HUYNH,
      ],
    },
    {
      tieuDe: 'Quản lý Người dùng',
      duongDan: '/nguoi-dung',
      bieuTuong: Users,
      vaiTroChoPhep: [VaiTro.QUAN_TRI_VIEN, VaiTro.GIAO_VU],
    },
    {
      tieuDe: 'Hồ sơ Cá nhân',
      duongDan: '/ho-so',
      bieuTuong: UserCheck,
      vaiTroChoPhep: [
        VaiTro.QUAN_TRI_VIEN,
        VaiTro.BAN_GIAM_HIEU,
        VaiTro.GIAO_VU,
        VaiTro.GIAO_VIEN,
        VaiTro.HOC_SINH,
        VaiTro.PHU_HUYNH,
      ],
    },
    {
      tieuDe: 'Học vụ & Đào tạo',
      duongDan: '/hoc-vu',
      bieuTuong: GraduationCap,
      vaiTroChoPhep: [VaiTro.QUAN_TRI_VIEN, VaiTro.BAN_GIAM_HIEU, VaiTro.GIAO_VU],
    },
    {
      tieuDe: 'Lớp học phần',
      duongDan: '/lop-hoc-phan',
      bieuTuong: Video,
      vaiTroChoPhep: [
        VaiTro.QUAN_TRI_VIEN,
        VaiTro.BAN_GIAM_HIEU,
        VaiTro.GIAO_VU,
        VaiTro.GIAO_VIEN,
        VaiTro.HOC_SINH,
        VaiTro.PHU_HUYNH,
      ],
    },
    {
      tieuDe: 'Thời khóa biểu',
      duongDan: '/thoi-khoa-bieu',
      bieuTuong: Calendar,
      vaiTroChoPhep: [
        VaiTro.QUAN_TRI_VIEN,
        VaiTro.BAN_GIAM_HIEU,
        VaiTro.GIAO_VU,
        VaiTro.GIAO_VIEN,
        VaiTro.HOC_SINH,
        VaiTro.PHU_HUYNH,
      ],
    },
    {
      tieuDe: 'Con em của tôi',
      duongDan: '/phu-huynh/con-em',
      bieuTuong: HeartHandshake,
      vaiTroChoPhep: [VaiTro.PHU_HUYNH, VaiTro.QUAN_TRI_VIEN],
    },
  ];

  const menuHienThi = danhMucMenu.filter(
    (item) =>
      !nguoiDung ||
      item.vaiTroChoPhep.includes(nguoiDung.vaiTro as VaiTro) ||
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN,
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-slate-200">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">LMS Trường Học</h1>
            <p className="text-[11px] text-slate-500">K23CNT1 Quang Tâm</p>
          </div>
        </div>

        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {menuHienThi.map((item) => {
            const BieuTuong = item.bieuTuong;
            const laTrangHienTai =
              pathname === item.duongDan ||
              (item.duongDan !== '/bang-dieu-khien' && pathname.startsWith(item.duongDan));
            return (
              <Link
                key={item.duongDan}
                href={item.duongDan}
                prefetch={true}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] select-none cursor-pointer ${
                  laTrangHienTai
                    ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1'
                }`}
              >
                {/* Vạch chỉ báo Active hiện đại bên lề trái */}
                {laTrangHienTai && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full shadow-xs shadow-blue-500/50" />
                )}
                <BieuTuong
                  className={`w-4 h-4 transition-transform duration-150 group-hover:scale-110 ${
                    laTrangHienTai ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.tieuDe}</span>
              </Link>
            );
          })}
        </nav>

        {/* Thông tin người dùng dưới chân Sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs shrink-0">
                {nguoiDung?.hoTen?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">{nguoiDung?.hoTen || 'Đang tải...'}</p>
                <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 font-medium">
                  {nguoiDung?.vaiTro || 'VAI_TRO'}
                </span>
              </div>
            </div>
            <button
              onClick={dangXuat}
              title="Đăng xuất"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {sidebarMo && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setSidebarMo(false)}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900 text-sm">LMS Trường Học</h1>
                  <p className="text-[10px] text-slate-500">K23CNT1 Quang Tâm</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarMo(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
              {menuHienThi.map((item) => {
                const BieuTuong = item.bieuTuong;
                const laTrangHienTai =
                  pathname === item.duongDan ||
                  (item.duongDan !== '/bang-dieu-khien' && pathname.startsWith(item.duongDan));
                return (
                  <Link
                    key={item.duongDan}
                    href={item.duongDan}
                    onClick={() => setSidebarMo(false)}
                    prefetch={true}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98] select-none ${
                      laTrangHienTai
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {laTrangHienTai && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}
                    <BieuTuong className={`w-4 h-4 ${laTrangHienTai ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.tieuDe}</span>
                  </Link>
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
                    <p className="text-xs font-semibold text-slate-900 truncate">{nguoiDung?.hoTen || 'Đang tải...'}</p>
                    <span className="text-[10px] text-blue-600 font-medium">{nguoiDung?.vaiTro}</span>
                  </div>
                </div>
                <button
                  onClick={dangXuat}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarMo(!sidebarMo)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Bảng điều khiển</span>
              <span>/</span>
              <span className="font-medium text-slate-800 capitalize">
                {pathname.replace('/', '').replace(/-/g, ' ') || 'Tổng quan'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Trực tuyến
            </span>
          </div>
        </header>

        {/* Dynamic Page Body with Smooth Transition */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div key={pathname} className="max-w-7xl mx-auto hieu-ung-chuyen-trang">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
