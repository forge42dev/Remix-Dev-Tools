 
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools, defineRdtConfig } from "remix-development-tools"
import { vitePlugin as remix  } from "@react-router/dev"
import { installGlobals } from '@react-router/node';

const config = defineRdtConfig({
  client: {
  defaultOpen: false,
  panelLocation: "top",
  position: "top-right",
  requireUrlFlag: true
  },server: {},
  pluginDir: "./plugins",
  includeInProd: true,
  unstable_console: true
}, ); 
installGlobals();

export default defineConfig({
  plugins: [remixDevTools(config),remix( ), tsconfigPaths()],
  server: {
    open: true, 
    port: 3000 , 
  }, 
});
