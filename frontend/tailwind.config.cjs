/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
        },
        accent: {
          500: "#0ea5e9",
        },
        slate: {
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

