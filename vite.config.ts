// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import ts2 from "rollup-plugin-typescript2";

export default defineConfig({
  plugins: [
    {
      ...ts2({
        check: true,
        exclude: [
          "**/__tests__/**",
          "**/__mocks__/**",
          "**/*.test.ts",
          "**/*.test.tsx",
          "**/*.config.ts",
          "**/env.ts",
          "**/components/**",
          "**/context/**",
          "**/hooks/**",
          "**/tabs/**",
          "**/utils/**",
          "**/remix-app-for-testing/**",
          "**/monitor/**",
        ],
        tsconfig: resolve(__dirname, `tsconfig.json`),
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: false,
            declaration: true,
            declarationMap: true,
          },
        },
      }),
      enforce: "pre",
    },
  ],
  publicDir: resolve(__dirname, "public"),
  build: {
    assetsDir: "public",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Remix Dev Tools",
      fileName: "index",
    },
    copyPublicDir: true,
    rollupOptions: {
      external: ["react", "react-dom", "@remix-run/react"],
      output: {
        globals: {
          react: "React",
          ["react-dom"]: "ReactDOM",
          ["@remix-run/react"]: "@remix-run/react",
        },
      },
    },
  },
});
