module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {},
  variants: {},
  daisyui: {
    themes: ['light', 'dark', 'black', 'lofi'],
  },
  plugins: [require('daisyui')],
};
