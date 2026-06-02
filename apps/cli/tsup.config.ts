import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ["@appkit/core", "@appkit/api-client"],
});
