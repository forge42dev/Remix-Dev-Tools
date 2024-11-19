/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../src/**/*.{tsx,ts}", "app/**/*.{tsx,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};
