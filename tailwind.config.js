/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
  extend: {
    colors: {
      primary: '#1e40af', // Azul
      accent: '#facc15',  // Amarillo
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  },
},
  plugins: [],
}
