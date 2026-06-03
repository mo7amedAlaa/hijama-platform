/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00C9A7",
        dark: "#070D1A",
        card: "#111E33",
      },
    },
  },
  plugins: [],
};
