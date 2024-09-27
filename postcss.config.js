import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting/index.js";
import autoprefixer from "autoprefixer";
import config from "./tailwind.config.js";


/** @type {import('postcss').Config} */
export default {
  plugins: [tailwindcssNesting(),tailwindcss(config), autoprefixer(),
     ],
};
