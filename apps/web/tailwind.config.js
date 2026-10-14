/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '720px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'active-bg': 'var(--active-bg)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        info: 'var(--info)',
        'info-soft': 'var(--info-soft)',
        warning: 'var(--warning)',
        'warning-soft': 'var(--warning-soft)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'var(--radius)',
      },
      fontFamily: {
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        sans: ['var(--font-sans)', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        accent: '0 2px 8px -1px color-mix(in srgb, var(--accent) 30%, transparent)',
      },
    },
  },
  plugins: [],
};
