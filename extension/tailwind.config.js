/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./sidepanel.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#2560e8",
      },
      typography: {
        DEFAULT: { css: { color: "#e4e4e7", a: { color: "#60a5fa" } } },
      },
    },
  },
  plugins: [],
};
