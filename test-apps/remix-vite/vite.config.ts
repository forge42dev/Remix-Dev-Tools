import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouterDevTools, defineRdtConfig } from "react-router-devtools"

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
  },
  pluginDir: "./plugins",
  includeInProd: true,
  server:  {
    serverTimingThreshold: 250
  }
});

export default defineConfig({
  plugins: [
    reactRouterDevTools( config),
    reactRouter(),
    tsconfigPaths()
  ],
  server: {
    open: true,
    port: 3005 ,
  },
});
