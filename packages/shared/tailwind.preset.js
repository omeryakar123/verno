/** NativeWind / Tailwind — colors.json ile senkron (tek kaynak) */
const colors = require("./colors.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "14px",
        sm: "10px",
        md: "12px",
        lg: "14px",
        xl: "18px",
        "2xl": "22px",
      },
      colors,
    },
  },
};
