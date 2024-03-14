import { unstable_RemixPWA } from '@remix-pwa/dev'
import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import { remixDevTools } from 'remix-development-tools'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    remixDevTools({
      includeInProd: true,
      client: { position: 'middle-right' },
      server: { silent: true },
    }),
    remix(),
    tsconfigPaths(),
  ],
  server: {
    open: true,
    port: 3000,
  },
})
