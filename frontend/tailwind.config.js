/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'hack-dark': '#0B1020',
        'hack-sidebar': '#0A0F1C',
        'hack-card': '#151D31',
        'hack-card-hover': '#1A243E',
        'hack-elevated': '#1B2640',
        'hack-border': '#29354D',
        'hack-border-light': '#384766',
        'hack-indigo': {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        'hack-cyan': {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          light: '#67E8F9',
          glow: 'rgba(34, 211, 238, 0.25)',
        },
        'hack-success': {
          DEFAULT: '#34D399',
          bg: 'rgba(52, 211, 153, 0.12)',
        },
        'hack-warning': {
          DEFAULT: '#FBBF24',
          bg: 'rgba(251, 191, 36, 0.12)',
        },
        'hack-error': {
          DEFAULT: '#FB7185',
          bg: 'rgba(251, 113, 133, 0.12)',
        },
        'hack-text-primary': '#F1F5F9',
        'hack-text-secondary': '#94A3B8',
        'hack-text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.35)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'cyan-glow': '0 0 15px rgba(34, 211, 238, 0.25)',
        'indigo-glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
}
