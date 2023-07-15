/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/RemixDevTools/**/*.{tsx,ts}"],
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in-left": {
          "0%": { opacity: 0, transform: "translateX(-100%)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-left": "fade-in-left 0.5s ease-in",
        "fade-in": "fade-in 0.5s ease-in",
      },
    },
  },
  prefix: "rdt-",
  plugins: [require("tailwindcss-animate")],
  important: true,
};
