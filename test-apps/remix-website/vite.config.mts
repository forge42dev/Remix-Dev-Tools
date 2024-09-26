import { defineConfig, splitVendorChunkPlugin } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";
import { remixDevTools } from "remix-development-tools";
 
export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  server: {
    open: true,
  },
  plugins: [remixDevTools({ unstable_console: true }),tsconfigPaths(), splitVendorChunkPlugin(), arraybuffer(), remix()],
});
