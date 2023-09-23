import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/cli.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  dts: true,
  minify: false,
  shims: true,
  format: ["cjs"],
  noExternal: ["d3-hierarchy", "d3-selection", "d3-zoom", "d3-shape"],
});
