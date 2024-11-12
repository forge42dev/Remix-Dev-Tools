
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import { reactRouterDevTools } from 'react-router-devtools'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    reactRouterDevTools({
      includeInProd: {
        client: true,
        server: true
      },
      client: { position: 'middle-right' },
      server: { silent: true },
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    open: true,
    port: 3000,
  },
})
