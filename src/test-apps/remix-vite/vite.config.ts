import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools, defineRdtConfig } from "remix-development-tools"
 
const config = defineRdtConfig({
  client: {
  defaultOpen: false,
  panelLocation: "top",
  position: "top-right",
  requireUrlFlag: false,
  liveUrls: [
    { url: "https://forge42.dev", name: "Production" }, 
    {
    url: "https://forge42.dev/staging",
    name: "Staging",
  }],
  },server: {
    silent: true,
  },
  pluginDir: "./plugins",
  includeInProd: true,
  
}, ); 
export default defineConfig({
  plugins: [remixDevTools( config),remix({ future: {
    unstable_singleFetch: true
  } }), tsconfigPaths()],
  server: {
    open: true, 
    port: 3000 , 
  }, 
});
