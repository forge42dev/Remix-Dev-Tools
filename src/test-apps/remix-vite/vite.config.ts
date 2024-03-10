import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools, defineRdtConfig } from "remix-development-tools"

const config = defineRdtConfig({
  client: {
  defaultOpen: false,
  panelLocation: "top",
  position: "top-right",
  requireUrlFlag: true
  },server: {},
  pluginDir: "./plugins",
  includeInProd: true
}, ); 

export default defineConfig({
  plugins: [remixDevTools(config),remix(), tsconfigPaths()],
  server: {
    open: true, 
    port: 3000 , 
  }, 
});
