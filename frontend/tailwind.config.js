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
        dark: {
          900: '#0B101D',
          800: '#111827',
          700: '#1F2937',
          600: '#374151',
          card: '#131C2E',
          header: '#0E1626'
        },
        risk: {
          low: '#10B981',
          medium: '#EAB308',
          high: '#F97316',
          critical: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
