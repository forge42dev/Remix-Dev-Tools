import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/vite.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  dts: true,
  format: ["cjs", "esm"],
  external: ["react"],
});
