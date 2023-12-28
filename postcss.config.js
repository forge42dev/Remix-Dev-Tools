import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import config from "./tailwind.config.js";
export default {
  plugins: [tailwindcss(config), autoprefixer()],
};
