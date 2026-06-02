import { resolve } from "path";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  build: {
    outDir: ".vite/build",
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, "preload/index.ts"),
      output: {
        entryFileNames: "preload.js",
        format: "cjs",
      },
      external: ["electron"],
    },
  },
});
