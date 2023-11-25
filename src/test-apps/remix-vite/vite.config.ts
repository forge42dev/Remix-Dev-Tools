import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools } from "remix-development-tools/vite"
export default defineConfig({
  plugins: [remixDevTools({pluginDir: "./plugins"}),remix(), tsconfigPaths()],
  server: {
    open: true, 
  }
});
