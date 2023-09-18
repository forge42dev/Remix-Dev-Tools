import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  dts: true,
  format: ["cjs", "esm"],
  external: ["react"],
  noExternal: ["d3-hierarchy", "d3-selection", "d3-zoom", "d3-shape"],
});
