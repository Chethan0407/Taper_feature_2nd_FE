/** @type {import('tailwindcss').Config} */
export default {
  // Required so Appearance (localStorage + <html class="dark">) overrides OS preference.
  // Default 'media' ignores .dark and only uses prefers-color-scheme.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brandable primary scale — channels set by applyBrandTheme()
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
          500: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
          600: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
          700: 'rgb(var(--brand-primary-hover-rgb) / <alpha-value>)',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0E0E0E',
        },
        light: {
          50: '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
          400: '#cbd5e1',
          500: '#94a3b8',
          600: '#64748b',
          700: '#475569',
          800: '#334155',
          900: '#1e293b',
          950: '#0f172a',
        },
        neon: {
          // Live branding: primary → neon-blue, secondary → neon-purple
          blue: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
          green: '#00ff88',
          purple: 'rgb(var(--brand-secondary-rgb) / <alpha-value>)',
          teal: '#14b8a6',
          amber: '#f59e0b',
          indigo: '#6366f1',
          pink: '#ec4899',
        },
        brand: {
          primary: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 1.2s infinite',
        'shimmer': 'shimmer 3.5s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 4px 14px rgb(var(--brand-primary-rgb) / 0.22)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
