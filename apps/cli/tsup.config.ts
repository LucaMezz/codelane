import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: false,
  sourcemap: true,
  clean: true,
  bundle: true,
  noExternal: ["@codelane/core", "@codelane/api-client"],
});
