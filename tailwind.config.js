/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F7F4',
        surface: '#FFFFFF',
        well: '#F1EFEA',
        hairline: '#E2E8F0',
        slateDeep: '#0F172A',
        charcoal: '#475569',
        mutedMeta: '#94A3B8',
        ashokaNavy: '#1E3A8A',
        terracotta: '#D97706',
        passText: '#15803D',
        passBg: '#DCFCE7',
        passBorder: '#86EFAC',
        warnText: '#B45309',
        warnBg: '#FEF3C7',
        warnBorder: '#FDE68A',
        failText: '#B91C1C',
        failBg: '#FEE2E2',
        failBorder: '#FCA5A5',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
