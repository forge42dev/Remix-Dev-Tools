import { unstable_RemixPWA } from '@remix-pwa/dev'
import { unstable_vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import { remixDevTools } from 'remix-development-tools/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [remix(), tsconfigPaths(), remixDevTools(), unstable_RemixPWA()],
  server: {
    open: true,
    port: 3000,
  },
})
