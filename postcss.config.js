import tailwindcss from "tailwindcss";
import tailwindcssNesting from "tailwindcss/nesting/index.js";
import autoprefixer from "autoprefixer";
import config from "./tailwind.config.js";
export default {
  plugins: [tailwindcss(config),tailwindcssNesting({
    
  }), autoprefixer()],
};
