import { defineConfig } from "tsup";
export default defineConfig({
  entry: ["src/cli.ts"],
  splitting: false,
  sourcemap: false,
  clean: false,
  minify: false,
  dts: true,
  format: ["esm"],
  noExternal: ["d3-hierarchy", "d3-selection", "d3-zoom", "d3-shape"],
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
});
