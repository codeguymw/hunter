import type { Config } from 'tailwindcss';

// Hunter design tokens — strictly monochrome. No accent color, ever.
// Contrast, type, and spacing carry the personality instead of a color accent.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A', // near-black surface
        void: '#000000',
        paper: '#FFFFFF',
        bone: '#F5F5F4', // off-white surface
        line: '#262626', // hairline dividers on dark
        'line-soft': '#E5E5E5', // hairline dividers on light
        smoke: '#737373', // muted text
        ash: '#A3A3A3',
        fog: '#D4D4D4',
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Archivo"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.05em',
        widest2: '0.3em',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'rise-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scan-line': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'pulse-ring': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'rise-in': 'rise-in 0.5s cubic-bezier(0.16,1,0.3,1)',
        'scan-line': 'scan-line 2.4s linear infinite',
        'pulse-ring': 'pulse-ring 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
