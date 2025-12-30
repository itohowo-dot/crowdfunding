import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          50: '#FEF3E6',
          100: '#FDE6CC',
          200: '#FBCB99',
          300: '#F9B066',
          400: '#F79433',
          500: '#F97316',
          600: '#E85A00',
          700: '#B64700',
          800: '#833400',
          900: '#512100',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '8px',
        'modal': '16px',
      },
      maxWidth: {
        'container': '1280px',
      },
    },
  },
  plugins: [],
}
export default config
