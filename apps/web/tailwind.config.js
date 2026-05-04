/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base':    '#0f0e0d',
        'bg-raised':  '#1a1917',
        'bg-overlay': '#242220',
        'bg-subtle':  '#2e2b28',
        'accent':     '#e8a44a',
        'accent-dim': '#b07a2e',
        'text-primary':   '#f0ebe4',
        'text-secondary': '#a89e93',
        'text-muted':     '#6b6259',
        'text-inverse':   '#0f0e0d',
        'success': '#5cb98c',
        'error':   '#e05c5c',
        'info':    '#6aadcf',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-sm': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['1.75rem',  { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-lg': ['2.25rem',  { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      animation: {
        'fade-up': 'fadeUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
