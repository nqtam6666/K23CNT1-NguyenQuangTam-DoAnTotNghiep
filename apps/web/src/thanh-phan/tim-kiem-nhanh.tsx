'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  X,
  Settings,
  UserCheck,
  GraduationCap,
  Users,
  Compass,
} from 'lucide-react';
import { DANH_MUC_CAI_DAT_HE_THONG, MaNhomCaiDat, VaiTro } from '@lms/chung';
import { locMenuTheoVaiTro } from '../cau-hinh/menu.cau-hinh';

interface Props {
  vaiTroNguoiDung?: string;
  dangMo: boolean;
  onDong: () => void;
}

interface KetQuaTimKiemMuc {
  id: string;
  tieuDe: string;
  moTaPhu: string;
  duongDan: string;
  nhomHienThi: string;
  bieuTuong: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  caiDatDich?: {
    nhom: MaNhomCaiDat;
    khoa: string;
  };
}

const TEN_NHOM_CAI_DAT: Record<MaNhomCaiDat, string> = {
  chung: 'Thông tin trường & Thương hiệu',
  giao_dien: 'Giao diện & Hiển thị',
  hoc_vu: 'Học vụ & Thang điểm',
  diem_danh: 'Điểm danh & Chuyên cần',
  phong_hoc: 'Phòng học trực tuyến',
  bai_tap: 'Bài tập & Tài liệu',
  tro_ly_ai: 'Trợ lý AI học thuật',
  thong_bao: 'Thông báo & Bản tin',
  bao_mat: 'Bảo mật & Đăng nhập',
  email: 'Máy chủ gửi thư (SMTP)',
  khac: 'Cấu hình khác',
};

function boDauTiengViet(chuoi: string): string {
  return chuoi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function TimKiemNhanh({ vaiTroNguoiDung, dangMo, onDong }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [tuKhoa, setTuKhoa] = useState('');
  const [viTriChon, setViTriChon] = useState(0);
  const [daMount, setDaMount] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hopThoaiRef = useRef<HTMLDivElement>(null);
  const danhSachKetQuaRef = useRef<HTMLDivElement>(null);
  const chuotNhanTrongHopThoaiRef = useRef(false);

  useEffect(() => {
    setDaMount(true);
  }, []);

  const danhSachMenuChoPhep = useMemo(() => {
    if (!vaiTroNguoiDung) return [];
    return locMenuTheoVaiTro(vaiTroNguoiDung);
  }, [vaiTroNguoiDung]);

  // Kho chỉ mục toàn bộ trang + mục con + từng cài đặt nhỏ
  const danhSachChiMucToanBo = useMemo<KetQuaTimKiemMuc[]>(() => {
    const danhSach: KetQuaTimKiemMuc[] = [];

    // 1. Các trang chính trên thanh bên
    for (const m of danhSachMenuChoPhep) {
      danhSach.push({
        id: `menu-${m.id}`,
        tieuDe: m.tieuDe,
        moTaPhu: m.duongDan,
        duongDan: m.duongDan,
        nhomHienThi: 'Phân hệ chính',
        bieuTuong: m.bieuTuong,
      });
    }

    // 2. Trang chủ công khai & Các mục nhỏ trong Hồ sơ cá nhân (mọi vai trò)
    if (vaiTroNguoiDung) {
      danhSach.push(
        {
          id: 'trang-chu-cong-khai',
          tieuDe: 'Trang chủ cổng thông tin công khai',
          moTaPhu: '/ · Xem giao diện trang chủ ngoài, thông tin trường & đồ án',
          duongDan: '/',
          nhomHienThi: 'Phân hệ chính',
          bieuTuong: Compass,
        },
        {
          id: 'ho-so-thong-tin',
          tieuDe: 'Cập nhật thông tin cá nhân & Ảnh đại diện',
          moTaPhu: 'Hồ sơ cá nhân · Họ tên, số điện thoại, ngày sinh',
          duongDan: '/ho-so',
          nhomHienThi: 'Mục chức năng',
          bieuTuong: UserCheck,
        },
        {
          id: 'ho-so-mat-khau',
          tieuDe: 'Đổi mật khẩu đăng nhập & Bảo mật tài khoản',
          moTaPhu: 'Hồ sơ cá nhân · Cập nhật mật khẩu mới',
          duongDan: '/ho-so',
          nhomHienThi: 'Mục chức năng',
          bieuTuong: UserCheck,
        },
      );
    }

    // 3. Các mục nhỏ trong Quản lý người dùng (Quản trị viên & Giáo vụ)
    if (
      vaiTroNguoiDung === VaiTro.QUAN_TRI_VIEN ||
      vaiTroNguoiDung === VaiTro.GIAO_VU
    ) {
      danhSach.push(
        {
          id: 'nguoi-dung-tao-moi',
          tieuDe: 'Tạo tài khoản & Đăng ký người dùng mới',
          moTaPhu: 'Quản lý người dùng · Cấp tài khoản Giáo viên, Học sinh, Phụ huynh',
          duongDan: '/nguoi-dung',
          nhomHienThi: 'Mục chức năng',
          bieuTuong: Users,
        },
      );
    }

    // 4. Các mục nhỏ trong Học vụ & Đào tạo
    if (
      vaiTroNguoiDung === VaiTro.QUAN_TRI_VIEN ||
      vaiTroNguoiDung === VaiTro.BAN_GIAM_HIEU ||
      vaiTroNguoiDung === VaiTro.GIAO_VU
    ) {
      danhSach.push(
        {
          id: 'hoc-vu-khoa-nganh-mon',
          tieuDe: 'Quản lý Khoa, Ngành đào tạo, Môn học & Học kỳ',
          moTaPhu: 'Học vụ và đào tạo · Danh mục chương trình đào tạo',
          duongDan: '/hoc-vu',
          nhomHienThi: 'Mục chức năng',
          bieuTuong: GraduationCap,
        },
      );
    }

    // 5. Toàn bộ 74 mục nhỏ trong Cài đặt hệ thống (Dành cho Quản trị viên)
    if (vaiTroNguoiDung === VaiTro.QUAN_TRI_VIEN) {
      for (const muc of DANH_MUC_CAI_DAT_HE_THONG) {
        const tenNhom = TEN_NHOM_CAI_DAT[muc.nhom] || muc.nhom;
        danhSach.push({
          id: `cai-dat-${muc.khoa}`,
          tieuDe: muc.nhan,
          moTaPhu: `${tenNhom} › ${muc.tieuDePhanNhom} · ${muc.khoa}`,
          duongDan: `/cai-dat?nhom=${muc.nhom}&khoa=${encodeURIComponent(muc.khoa)}`,
          nhomHienThi: 'Cài đặt hệ thống',
          bieuTuong: Settings,
          caiDatDich: {
            nhom: muc.nhom,
            khoa: muc.khoa,
          },
        });
      }
    }

    return danhSach;
  }, [danhSachMenuChoPhep, vaiTroNguoiDung]);

  const ketQuaTimKiem = useMemo<KetQuaTimKiemMuc[]>(() => {
    const raw = tuKhoa.trim();
    if (!raw) {
      // Khi chưa gõ từ khóa: hiển thị các phân hệ chính
      return danhSachChiMucToanBo.filter((m) => m.nhomHienThi === 'Phân hệ chính');
    }

    const tuKhoaThuong = raw.toLowerCase();
    const tuKhoaKhongDau = boDauTiengViet(raw);
    const cacTuCon = tuKhoaKhongDau.split(/\s+/).filter(Boolean);

    const danhSachKhop: Array<{ muc: KetQuaTimKiemMuc; diem: number }> = [];

    for (const muc of danhSachChiMucToanBo) {
      const tieuDeThuong = muc.tieuDe.toLowerCase();
      const moTaThuong = muc.moTaPhu.toLowerCase();
      const tieuDeKhongDau = boDauTiengViet(muc.tieuDe);
      const moTaKhongDau = boDauTiengViet(muc.moTaPhu);
      const toanBoKhongDau = `${tieuDeKhongDau} ${moTaKhongDau}`;

      let diem = 0;
      if (tieuDeThuong.includes(tuKhoaThuong)) {
        diem += tieuDeThuong.startsWith(tuKhoaThuong) ? 120 : 90;
      } else if (tieuDeKhongDau.includes(tuKhoaKhongDau)) {
        diem += tieuDeKhongDau.startsWith(tuKhoaKhongDau) ? 100 : 75;
      } else if (moTaThuong.includes(tuKhoaThuong)) {
        diem += 60;
      } else if (moTaKhongDau.includes(tuKhoaKhongDau)) {
        diem += 50;
      } else if (
        cacTuCon.length > 1 &&
        cacTuCon.every((tu) => toanBoKhongDau.includes(tu))
      ) {
        diem += 40;
      }

      if (diem > 0) {
        danhSachKhop.push({ muc, diem });
      }
    }

    return danhSachKhop
      .sort((a, b) => b.diem - a.diem)
      .slice(0, 18)
      .map((x) => x.muc);
  }, [danhSachChiMucToanBo, tuKhoa]);

  const thucHienMoMuc = (muc: KetQuaTimKiemMuc) => {
    onDong();
    if (muc.caiDatDich && pathname === '/cai-dat') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('nhom', muc.caiDatDich.nhom);
        url.searchParams.set('khoa', muc.caiDatDich.khoa);
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
      } catch {
        // Bỏ qua
      }
      window.dispatchEvent(
        new CustomEvent('lms:dieu-huong-cai-dat', {
          detail: muc.caiDatDich,
        }),
      );
      return;
    }
    router.push(muc.duongDan);
  };

  useEffect(() => {
    if (dangMo) {
      setTuKhoa('');
      setViTriChon(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [dangMo]);

  // Tự động giữ mục đang chọn bằng bàn phím luôn nằm trong vùng nhìn thấy
  useEffect(() => {
    if (!dangMo || !danhSachKetQuaRef.current) return;
    const phanTu = danhSachKetQuaRef.current.querySelector<HTMLElement>(
      `[data-search-index="${viTriChon}"]`,
    );
    phanTu?.scrollIntoView({ block: 'nearest' });
  }, [viTriChon, dangMo]);

  useEffect(() => {
    if (!dangMo) return;

    const xuLyPhim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDong();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setViTriChon((prev) => (prev + 1) % (ketQuaTimKiem.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setViTriChon(
          (prev) => (prev - 1 + (ketQuaTimKiem.length || 1)) % (ketQuaTimKiem.length || 1),
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (ketQuaTimKiem[viTriChon]) {
          thucHienMoMuc(ketQuaTimKiem[viTriChon]);
        }
      }
    };

    window.addEventListener('keydown', xuLyPhim);
    return () => window.removeEventListener('keydown', xuLyPhim);
  }, [dangMo, ketQuaTimKiem, viTriChon, pathname]);

  const xuLyMouseDown = (e: React.MouseEvent) => {
    if (hopThoaiRef.current && hopThoaiRef.current.contains(e.target as Node)) {
      chuotNhanTrongHopThoaiRef.current = true;
    } else {
      chuotNhanTrongHopThoaiRef.current = false;
    }
  };

  const xuLyBackdropClick = (e: React.MouseEvent) => {
    if (
      !chuotNhanTrongHopThoaiRef.current &&
      hopThoaiRef.current &&
      !hopThoaiRef.current.contains(e.target as Node)
    ) {
      onDong();
    }
    chuotNhanTrongHopThoaiRef.current = false;
  };

  if (!daMount || !dangMo) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 px-4 bg-black/55 animate-in fade-in duration-150"
      onMouseDown={xuLyMouseDown}
      onClick={xuLyBackdropClick}
    >
      <div
        ref={hopThoaiRef}
        role="dialog"
        aria-modal="true"
        aria-label="Thanh tìm kiếm nhanh và điều hướng"
        className="w-full max-w-xl bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] border border-[var(--border)] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Ô nhập liệu tìm kiếm */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-3">
          <Search strokeWidth={1.5} className="w-[18px] h-[18px] text-[var(--muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={tuKhoa}
            onChange={(e) => {
              setTuKhoa(e.target.value);
              setViTriChon(0);
            }}
            placeholder="Tìm trang, chức năng hoặc mục cài đặt nhỏ (ví dụ: đăng ký, màu chủ đạo, đi muộn)..."
            className="flex-1 bg-transparent text-[var(--text)] text-sm placeholder:text-[var(--muted)]/75 border-none focus:outline-none focus:ring-0"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => {
                setTuKhoa('');
                setViTriChon(0);
              }}
              aria-label="Xóa từ khóa"
              className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)] cursor-pointer"
            >
              <X strokeWidth={1.5} className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)]">
            ESC
          </kbd>
        </div>

        {/* Danh sách kết quả */}
        <div ref={danhSachKetQuaRef} className="max-h-80 overflow-y-auto p-2 space-y-1">
          {ketQuaTimKiem.length === 0 ? (
            <div className="py-8 text-center text-[var(--muted)] text-sm">
              Không tìm thấy mục nào khớp với &quot;{tuKhoa}&quot;
            </div>
          ) : (
            ketQuaTimKiem.map((item, index) => {
              const BieuTuong = item.bieuTuong;
              const dangChon = index === viTriChon;

              return (
                <div
                  key={item.id}
                  data-id={item.id}
                  data-search-index={index}
                  onClick={() => thucHienMoMuc(item)}
                  onMouseEnter={() => setViTriChon(index)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[var(--radius)] cursor-pointer transition-colors border-l-[3px] ${
                    dangChon
                      ? 'bg-[var(--accent-soft)] border-l-[var(--accent)] text-[var(--accent)]'
                      : 'border-l-transparent text-[var(--text)] hover:bg-[var(--active-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`p-1.5 rounded-[var(--radius)] border transition-colors shrink-0 ${
                        dangChon
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]'
                      }`}
                    >
                      <BieuTuong strokeWidth={1.5} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-sans text-[13px] font-semibold text-[var(--text)] truncate">
                          {item.tieuDe}
                        </p>
                        <span className="px-1.5 py-0.5 font-mono text-[10px] rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] shrink-0">
                          {item.nhomHienThi}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] text-[var(--muted)] truncate mt-0.5">
                        {item.moTaPhu}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    strokeWidth={1.5}
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      dangChon ? 'text-[var(--accent)] translate-x-0.5' : 'text-[var(--muted)]'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Chân hộp thoại */}
        <div className="px-4 py-2.5 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between font-mono text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <span>Dùng</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)]">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)]">
              ↓
            </kbd>
            <span>để di chuyển</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)]">
              ↵
            </kbd>
            <span>để nhảy tới mục</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
