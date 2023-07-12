/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/RemixDevTools/**/*.{tsx,ts}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in-left": {
          "0%": { opacity: 0, transform: "translateX(-100%)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in-left": "fade-in-left 0.5s ease-out",
      },
    },
  },
  prefix: "rdt-",
  plugins: [],
  important: true,
};
