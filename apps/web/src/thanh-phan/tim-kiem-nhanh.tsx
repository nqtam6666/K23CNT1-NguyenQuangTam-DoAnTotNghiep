'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  Video,
  Settings,
  HeartHandshake,
  Info,
  ArrowRight,
  X,
  Command,
} from 'lucide-react';
import { locMenuTheoVaiTro } from '../cau-hinh/menu.cau-hinh';
import { VaiTro } from '@lms/chung';

interface Props {
  vaiTroNguoiDung?: string;
  dangMo: boolean;
  onDong: () => void;
}

export function TimKiemNhanh({ vaiTroNguoiDung, dangMo, onDong }: Props) {
  const router = useRouter();
  const [tuKhoa, setTuKhoa] = useState('');
  const [viTriChon, setViTriChon] = useState(0);
  const [daMount, setDaMount] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hopThoaiRef = useRef<HTMLDivElement>(null);
  const chuotNhanTrongHopThoaiRef = useRef(false);

  useEffect(() => {
    setDaMount(true);
  }, []);

  // Lấy các mục menu người dùng có quyền
  const danhSachMenuChoPhep = useMemo(() => {
    if (!vaiTroNguoiDung) return [];
    return locMenuTheoVaiTro(vaiTroNguoiDung);
  }, [vaiTroNguoiDung]);

  // Lọc theo từ khóa tìm kiếm
  const ketQuaTimKiem = useMemo(() => {
    if (!tuKhoa.trim()) {
      return danhSachMenuChoPhep;
    }
    const tuKhoaThuong = tuKhoa.toLowerCase().trim();
    return danhSachMenuChoPhep.filter(
      (m) =>
        m.tieuDe.toLowerCase().includes(tuKhoaThuong) ||
        m.duongDan.toLowerCase().includes(tuKhoaThuong),
    );
  }, [danhSachMenuChoPhep, tuKhoa]);

  // Tự động focus vào ô tìm kiếm khi mở
  useEffect(() => {
    if (dangMo) {
      setTuKhoa('');
      setViTriChon(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [dangMo]);

  // Điều hướng bằng bàn phím
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
        setViTriChon((prev) => (prev - 1 + ketQuaTimKiem.length) % (ketQuaTimKiem.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (ketQuaTimKiem[viTriChon]) {
          router.push(ketQuaTimKiem[viTriChon].duongDan);
          onDong();
        }
      }
    };

    window.addEventListener('keydown', xuLyPhim);
    return () => window.removeEventListener('keydown', xuLyPhim);
  }, [dangMo, ketQuaTimKiem, viTriChon, router, onDong]);

  // Xử lý click ngoài chuẩn Rule 07 (chống vô tình thoát khi bôi đen chuột kéo ra ngoài)
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={xuLyMouseDown}
      onClick={xuLyBackdropClick}
    >
      <div
        ref={hopThoaiRef}
        role="dialog"
        aria-modal="true"
        aria-label="Thanh tìm kiếm nhanh và điều hướng"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Ô nhập liệu tìm kiếm */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={tuKhoa}
            onChange={(e) => {
              setTuKhoa(e.target.value);
              setViTriChon(0);
            }}
            placeholder="Tìm kiếm trang, chức năng hoặc tài liệu (Ctrl+K)..."
            className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 focus:outline-none"
          />
          {tuKhoa && (
            <button
              onClick={() => setTuKhoa('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Danh sách kết quả */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {ketQuaTimKiem.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              Không tìm thấy mục nào khớp với &quot;{tuKhoa}&quot;
            </div>
          ) : (
            ketQuaTimKiem.map((item, index) => {
              const BieuTuong = item.bieuTuong;
              const dangChon = index === viTriChon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.duongDan);
                    onDong();
                  }}
                  onMouseEnter={() => setViTriChon(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    dangChon
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        dangChon ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <BieuTuong className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.tieuDe}</p>
                      <p className="text-[11px] text-slate-400">{item.duongDan}</p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      dangChon ? 'text-blue-600 translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Chân hộp thoại */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>Dùng</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↓</kbd>
            <span>để di chuyển</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↵</kbd>
            <span>để mở</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
