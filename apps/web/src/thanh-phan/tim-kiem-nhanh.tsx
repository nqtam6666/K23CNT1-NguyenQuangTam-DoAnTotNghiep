'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import { locMenuTheoVaiTro } from '../cau-hinh/menu.cau-hinh';

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

  const danhSachMenuChoPhep = useMemo(() => {
    if (!vaiTroNguoiDung) return [];
    return locMenuTheoVaiTro(vaiTroNguoiDung);
  }, [vaiTroNguoiDung]);

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

  useEffect(() => {
    if (dangMo) {
      setTuKhoa('');
      setViTriChon(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [dangMo]);

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
            placeholder="Tìm kiếm trang, chức năng hoặc tài liệu (Ctrl+K)..."
            className="flex-1 bg-transparent text-[var(--text)] text-sm placeholder:text-[var(--muted)]/75 border-none focus:outline-none focus:ring-0"
          />
          {tuKhoa && (
            <button
              type="button"
              onClick={() => setTuKhoa('')}
              aria-label="Xóa từ khóa"
              className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)]"
            >
              <X strokeWidth={1.5} className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)]">
            ESC
          </kbd>
        </div>

        {/* Danh sách kết quả */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
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
                  onClick={() => {
                    router.push(item.duongDan);
                    onDong();
                  }}
                  onMouseEnter={() => setViTriChon(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius)] cursor-pointer transition-colors ${
                    dangChon
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text)] hover:bg-[var(--active-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-[var(--radius)] border ${
                        dangChon
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]'
                      }`}
                    >
                      <BieuTuong strokeWidth={1.5} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-semibold text-[var(--text)]">
                        {item.tieuDe}
                      </p>
                      <p className="font-mono text-[11px] text-[var(--muted)]">{item.duongDan}</p>
                    </div>
                  </div>

                  <ArrowRight
                    strokeWidth={1.5}
                    className={`w-4 h-4 transition-transform ${
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
            <span>để mở</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
