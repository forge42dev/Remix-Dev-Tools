import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/vite.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  dts: true,
  format: ["esm"],
  external: ["react"],
});
