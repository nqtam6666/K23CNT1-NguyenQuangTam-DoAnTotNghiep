'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    gtranslateSettings?: {
      default_language: string;
      detect_browser_language: boolean;
      languages: string[];
      wrapper_selector: string;
      native_language_names?: boolean;
    };
  }
}

/**
 * Thành phần Dịch ngôn ngữ tự động sử dụng GTranslate Widget
 * Hỗ trợ đa ngôn ngữ: vi, en, zh-CN, it, es, de, ar, tr, ru, uk, km, th, fr
 */
export function DichNgonNgu() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Khởi tạo cấu hình gtranslateSettings trên đối tượng window
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

    // 2. Chèn script dropdown.js của GTranslate
    const idScript = 'gtranslate-dropdown-script';
    let script = document.getElementById(idScript) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = idScript;
      script.src = 'https://cdn.gtranslate.net/widgets/latest/dropdown.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div ref={containerRef} className="flex items-center" title="Dịch ngôn ngữ">
      <div className="gtranslate_wrapper" />
    </div>
  );
}
