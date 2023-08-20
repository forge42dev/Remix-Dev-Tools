// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import ts2 from "rollup-plugin-typescript2";

export default defineConfig({
  plugins: [
    {
      ...ts2({
        check: true,
        include: [
          "**/RemixDevTools/RemixDevTools.tsx",
          "**/RemixDevTools/index.ts",
          "**/src/index.ts",
          "**/hooks/useRemixForgeSocket.ts",
          "**/tabs/index.tsx",
          "**/init/project.tsx",
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
      fileName: (format) => `index.${format === "es" ? "mjs" : "umd.cjs"}`,
    },
    emptyOutDir: false,
    copyPublicDir: true,
    rollupOptions: {
      external: ["react", "react-dom", "@remix-run/react"],
      output: {
        exports: "named",
        globals: {
          react: "React",
          ["react-dom"]: "ReactDOM",
          ["@remix-run/react"]: "@remix-run/react",
        },
        assetFileNames: "stylesheet[extname]",
      },
    },
  },
});
