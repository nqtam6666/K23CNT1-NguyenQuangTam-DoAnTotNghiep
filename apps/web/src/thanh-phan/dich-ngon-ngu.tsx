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
  co: string;
}

const DANH_SACH_NGON_NGU: NgonNguInfo[] = [
  { ma: 'vi', ten: 'Tiếng Việt', co: '🇻🇳' },
  { ma: 'en', ten: 'English', co: '🇬🇧' },
  { ma: 'zh-CN', ten: '简体中文', co: '🇨🇳' },
  { ma: 'it', ten: 'Italiano', co: '🇮🇹' },
  { ma: 'es', ten: 'Español', co: '🇪🇸' },
  { ma: 'de', ten: 'Deutsch', co: '🇩🇪' },
  { ma: 'ar', ten: 'العربية', co: '🇸🇦' },
  { ma: 'tr', ten: 'Türkçe', co: '🇹🇷' },
  { ma: 'ru', ten: 'Русский', co: '🇷🇺' },
  { ma: 'uk', ten: 'Українська', co: '🇺🇦' },
  { ma: 'km', ten: 'ភាសាខ្មែរ', co: '🇰🇭' },
  { ma: 'th', ten: 'ไทย', co: '🇹🇭' },
  { ma: 'fr', ten: 'Français', co: '🇫🇷' },
];

/**
 * Thành phần Dịch ngôn ngữ tự động với giao diện UI hiện đại (Custom Popover Dropdown)
 * Kết nối ngầm với GTranslate engine:
 * - Không hiển thị thẻ select thô kệch mặc định của trình duyệt
 * - Thiết kế bo góc hiện đại, đổ bóng, hỗ trợ Dark/Light mode chuẩn mực
 * - Tự động ghi nhớ và chuyển đổi ngôn ngữ mượt mà
 */
export function DichNgonNgu() {
  const [dangMo, setDangMo] = useState(false);
  const [ngonNguHienTai, setNgonNguHienTai] = useState('vi');
  const hopThoaiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Cấu hình gtranslateSettings trên window theo đúng chuẩn
    window.gtranslateSettings = {
      default_language: 'vi',
      detect_browser_language: true,
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

    // 2. Nạp script GTranslate dropdown.js nếu chưa có
    const idScript = 'gtranslate-dropdown-script';
    let script = document.getElementById(idScript) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = idScript;
      script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
      script.defer = true;
      document.body.appendChild(script);
    }

    // 3. Khôi phục ngôn ngữ đã lưu nếu có
    try {
      const daLuu = localStorage.getItem('lms_ngon_ngu');
      if (daLuu && DANH_SACH_NGON_NGU.some((n) => n.ma === daLuu)) {
        setNgonNguHienTai(daLuu);
        if (daLuu !== 'vi' && typeof window !== 'undefined' && typeof window.doGTranslate === 'function') {
          window.doGTranslate(`vi|${daLuu}`);
        }
      }
    } catch {
      // Bỏ qua lỗi đọc localStorage
    }
  }, []);

  // Đóng dropdown khi click bên ngoài hoặc nhấn phím Escape
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
      {/* Vùng chứa ẩn cho GTranslate script khởi tạo engine */}
      <div className="gtranslate_wrapper hidden" aria-hidden="true" />

      {/* Nút bấm kích hoạt mở danh mục ngôn ngữ */}
      <button
        type="button"
        onClick={() => setDangMo((prev) => !prev)}
        aria-label="Chọn ngôn ngữ giao diện"
        aria-expanded={dangMo}
        data-testid="nut-chon-ngon-ngu"
        className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs text-xs font-semibold"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
        <span className="inline-flex items-center justify-center text-sm leading-none shrink-0 select-none -translate-y-px">
          {thongTinHienTai.co}
        </span>
        <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-200 max-w-[85px] truncate">
          {thongTinHienTai.ten}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            dangMo ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Hộp chọn ngôn ngữ hiện đại (Custom Popover) */}
      {dangMo && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Chọn ngôn ngữ / Language
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 pr-0.5">
            {DANH_SACH_NGON_NGU.map((lang) => {
              const laDangChon = lang.ma === ngonNguHienTai;
              return (
                <button
                  key={lang.ma}
                  type="button"
                  onClick={() => chonNgonNgu(lang.ma)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer select-none text-left ${
                    laDangChon
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-5 text-base leading-none shrink-0 select-none -translate-y-[1.5px]">
                      {lang.co}
                    </span>
                    <span className="truncate">{lang.ten}</span>
                  </div>
                  {laDangChon && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
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
