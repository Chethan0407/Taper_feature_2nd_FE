/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0E0E0E',
        },
        neon: {
          blue: '#00d4ff',
          purple: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
