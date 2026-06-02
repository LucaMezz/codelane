import { defineConfig } from "vite";
import native from "vite-plugin-native";

// https://vitejs.dev/config
// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    native({
      // Load C/C++ native modules. Like sqlite3, better-sqlite3, fsevents etc.
      webpack: {},
    }),
  ],
});
