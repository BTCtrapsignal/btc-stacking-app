/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      colors: {
        /* ── Light theme ── */
        'l-bg':      '#f4f3ef',
        'l-surface': '#eceae4',
        'l-card':    '#ffffff',
        'l-border':  '#e2dfd7',
        'l-text':    '#0d0d0b',
        'l-text2':   '#3a3930',
        'l-muted':   '#8c8980',

        /* ── Dark theme ── */
        'd-bg':      '#0b0c0e',
        'd-surface': '#141619',
        'd-card':    '#1c1f28',
        'd-border':  '#252830',
        'd-text':    '#eceef3',
        'd-text2':   '#b8bcc8',
        'd-muted':   '#686e7d',

        /* ── Brand (same both modes) ── */
        btc:    '#f7931a',
        green:  '#22c55e',
        red:    '#ef4444',
        yellow: '#facc15',
        orange: '#f59e0b',
        blue:   '#60a5fa',
        purple: '#a78bfa',
      },
      borderRadius: {
        card: '16px',
        chip: '999px',
      },
    },
  },
  plugins: [],
}
