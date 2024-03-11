/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./edit.html"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "black"],
  },
  plugins: [require("daisyui")],
};
