import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,

    includeSource: ["renderer/src/**/*.{ts,tsx}"],

    environment: "happy-dom",
  },

  define: {
    "import.meta.vitest": "undefined",
  },
});
