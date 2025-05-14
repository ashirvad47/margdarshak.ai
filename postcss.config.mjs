// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-preset-mantine': {},
    'tailwindcss/nesting': {}, // Or just 'postcss-nesting' if you installed that separately
    'tailwindcss': {},
    'autoprefixer': {},
  },
};
export default config;