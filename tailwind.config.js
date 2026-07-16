/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:"#E1F5EE", 100:"#9FE1CB", 200:"#5DCAA5", 400:"#1D9E75", 600:"#0F6E56", 800:"#085041", 900:"#04342C" },
        dark: { DEFAULT:"#0D2137", 800:"#1A3550", 600:"#2E4D68" }
      },
      fontFamily: { sans: ["Inter","system-ui","sans-serif"] }
    }
  },
  plugins: []
}
