/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070C0',
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B0FF',
          400: '#3396FF',
          500: '#0070C0',
          600: '#005A99',
          700: '#004373',
          800: '#002D4D',
          900: '#001626',
        },
        success: '#93C47D',
        warning: '#E69138',
        danger: '#E06666',
        purple: '#8E7CC3',
        pink: '#A64D79',
      },
    },
  },
  plugins: [],
}
