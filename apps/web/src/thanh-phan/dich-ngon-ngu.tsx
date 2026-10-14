'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

declare global {
  interface Window {
    gtranslateSettings?: {
      default_language: string;
      detect_browser_language: boolean;
      languages: string[];
      wrapper_selector: string;
      native_language_names?: boolean;
    };
    doGTranslate?: (langPair: string) => void;
  }
}

interface NgonNguInfo {
  ma: string;
  ten: string;
  nhanVietTat: string;
}

const DANH_SACH_NGON_NGU: NgonNguInfo[] = [
  { ma: 'vi', ten: 'Tiếng Việt', nhanVietTat: 'VI' },
  { ma: 'en', ten: 'English', nhanVietTat: 'EN' },
  { ma: 'zh-CN', ten: '简体中文', nhanVietTat: 'ZH' },
  { ma: 'it', ten: 'Italiano', nhanVietTat: 'IT' },
  { ma: 'es', ten: 'Español', nhanVietTat: 'ES' },
  { ma: 'de', ten: 'Deutsch', nhanVietTat: 'DE' },
  { ma: 'ar', ten: 'العربية', nhanVietTat: 'AR' },
  { ma: 'tr', ten: 'Türkçe', nhanVietTat: 'TR' },
  { ma: 'ru', ten: 'Русский', nhanVietTat: 'RU' },
  { ma: 'uk', ten: 'Українська', nhanVietTat: 'UK' },
  { ma: 'km', ten: 'ភាសាខ្មែរ', nhanVietTat: 'KM' },
  { ma: 'th', ten: 'ไทย', nhanVietTat: 'TH' },
  { ma: 'fr', ten: 'Français', nhanVietTat: 'FR' },
];

export function DichNgonNgu() {
  const [dangMo, setDangMo] = useState(false);
  const [ngonNguHienTai, setNgonNguHienTai] = useState('vi');
  const hopThoaiRef = useRef<HTMLDivElement>(null);

  const napScriptGTranslate = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    window.gtranslateSettings = {
      default_language: 'vi',
      detect_browser_language: false,
      languages: [
        'vi',
        'en',
        'zh-CN',
        'it',
        'es',
        'de',
        'ar',
        'tr',
        'ru',
        'uk',
        'km',
        'th',
        'fr',
      ],
      wrapper_selector: '.gtranslate_wrapper',
      native_language_names: true,
    };

    const idScript = 'gtranslate-dropdown-script';
    let script = document.getElementById(idScript) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = idScript;
      script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  };

  useEffect(() => {
    try {
      const daLuu = localStorage.getItem('lms_ngon_ngu');
      if (daLuu && DANH_SACH_NGON_NGU.some((n) => n.ma === daLuu)) {
        setNgonNguHienTai(daLuu);
        if (daLuu !== 'vi') {
          napScriptGTranslate();
          if (typeof window !== 'undefined' && typeof window.doGTranslate === 'function') {
            window.doGTranslate(`vi|${daLuu}`);
          }
        }
      }
    } catch {
      // Bỏ qua lỗi đọc localStorage
    }
  }, []);

  useEffect(() => {
    if (!dangMo) return;

    const xuLyNhanNgoai = (e: MouseEvent) => {
      if (hopThoaiRef.current && !hopThoaiRef.current.contains(e.target as Node)) {
        setDangMo(false);
      }
    };

    const xuLyPhim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDangMo(false);
      }
    };

    document.addEventListener('pointerdown', xuLyNhanNgoai);
    document.addEventListener('keydown', xuLyPhim);
    return () => {
      document.removeEventListener('pointerdown', xuLyNhanNgoai);
      document.removeEventListener('keydown', xuLyPhim);
    };
  }, [dangMo]);

  const chonNgonNgu = (maNgonNgu: string) => {
    setNgonNguHienTai(maNgonNgu);
    setDangMo(false);
    napScriptGTranslate();

    try {
      localStorage.setItem('lms_ngon_ngu', maNgonNgu);
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }

    if (typeof window !== 'undefined' && typeof window.doGTranslate === 'function') {
      window.doGTranslate(`vi|${maNgonNgu}`);
    }
  };

  const thongTinHienTai =
    DANH_SACH_NGON_NGU.find((n) => n.ma === ngonNguHienTai) || DANH_SACH_NGON_NGU[0];

  return (
    <div ref={hopThoaiRef} className="relative notranslate">
      <div className="gtranslate_wrapper hidden" aria-hidden="true" />

      <button
        type="button"
        onClick={() => {
          napScriptGTranslate();
          setDangMo((prev) => !prev);
        }}
        aria-label="Chọn ngôn ngữ giao diện"
        aria-expanded={dangMo}
        data-testid="nut-chon-ngon-ngu"
        className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors font-mono text-xs font-semibold whitespace-nowrap shrink-0"
      >
        <Globe strokeWidth={1.5} className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
        <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
          {thongTinHienTai.nhanVietTat}
        </span>
        <span className="hidden md:inline font-mono text-xs text-[var(--text)] max-w-[85px] truncate">
          {thongTinHienTai.ten}
        </span>
        <ChevronDown
          strokeWidth={1.5}
          className={`w-3.5 h-3.5 text-[var(--muted)] transition-transform duration-150 shrink-0 ${
            dangMo ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dangMo && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[var(--border)] mb-1">
            <p className="eyebrow">NGÔN NGỮ HIỂN THỊ</p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-0.5">
            {DANH_SACH_NGON_NGU.map((lang) => {
              const laDangChon = lang.ma === ngonNguHienTai;
              return (
                <button
                  key={lang.ma}
                  type="button"
                  onClick={() => chonNgonNgu(lang.ma)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius)] font-mono text-xs transition-colors cursor-pointer select-none text-left ${
                    laDangChon
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'text-[var(--text)] hover:bg-[var(--active-bg)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-6 font-mono text-[10px] font-bold text-[var(--muted)]">
                      {lang.nhanVietTat}
                    </span>
                    <span className="truncate">{lang.ten}</span>
                  </div>
                  {laDangChon && (
                    <Check strokeWidth={1.5} className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
