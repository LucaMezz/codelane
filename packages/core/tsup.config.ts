import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "metadata/index": "src/metadata/index.ts",
  },
  format: ["esm", "cjs"],
  clean: true,
  target: "es2020",

  tsconfig: "./tsconfig.json",
});
