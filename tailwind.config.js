/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
      poppins: ["Poppins", "sans-serif"],
      michroma: ['Michroma', 'sans-serif'],
    },
    extend: {
      // other extensions...
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
        },
          animation: {
          shine: 'shine 5s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
};
