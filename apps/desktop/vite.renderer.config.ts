import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, searchForWorkspaceRoot, type Plugin } from "vite";

import { defaultPorts } from "../../packages/config/src/defaults.ts";
import { envNames } from "../../packages/config/src/env-names.ts";

const workspaceRoot = searchForWorkspaceRoot(__dirname);

const packageSourceDirs = [
  path.resolve(workspaceRoot, "packages/config/src"),
  path.resolve(workspaceRoot, "packages/frontend/src"),
  path.resolve(workspaceRoot, "packages/ui/src"),
  path.resolve(workspaceRoot, "packages/api-client/src"),
  path.resolve(workspaceRoot, "packages/core/src"),
];

function watchWorkspacePackages(): Plugin {
  return {
    name: "watch-workspace-packages",
    configureServer(server) {
      for (const dir of packageSourceDirs) {
        server.watcher.add(dir);
      }
    },
  };
}

// https://vitejs.dev/config
// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, workspaceRoot, "");
  const desktopRendererPort = Number(
    rootEnv[envNames.desktopRendererPort] ?? defaultPorts.desktopRenderer,
  );

  return {
    envDir: workspaceRoot,

    plugins: [react(), watchWorkspacePackages()],

    root: path.resolve(__dirname, "renderer"),

    base: "./",

    resolve: {
      alias: [
        {
          find: "@appkit/config/client",
          replacement: path.resolve(workspaceRoot, "packages/config/src/client.ts"),
        },
        {
          find: "@appkit/config",
          replacement: path.resolve(workspaceRoot, "packages/config/src/index.ts"),
        },
        {
          find: "@appkit/frontend/globals.css",
          replacement: path.resolve(workspaceRoot, "packages/frontend/src/styles/globals.css"),
        },
        {
          find: "@appkit/frontend",
          replacement: path.resolve(workspaceRoot, "packages/frontend/src/index.ts"),
        },
        {
          find: "@appkit/ui/globals.css",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/styles/globals.css"),
        },
        {
          find: "@appkit/ui/client",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/client.ts"),
        },
        {
          find: "@appkit/ui",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/index.ts"),
        },
        {
          find: "@appkit/api-client",
          replacement: path.resolve(workspaceRoot, "packages/api-client/src/index.ts"),
        },
        {
          find: "@appkit/core",
          replacement: path.resolve(workspaceRoot, "packages/core/src/index.ts"),
        },
      ],

      dedupe: ["react", "react-dom"],
    },

    build: {
      outDir: path.resolve(__dirname, ".vite/renderer/main_window"),
      emptyOutDir: true,
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",

        "use-sync-external-store/shim",
        "use-sync-external-store/shim/index.js",
        "use-sync-external-store/shim/with-selector",
        "use-sync-external-store/shim/with-selector.js",
      ],
      exclude: [
        "@appkit/config",
        "@appkit/frontend",
        "@appkit/ui",
        "@appkit/api-client",
        "@appkit/core",
      ],
    },

    server: {
      fs: {
        allow: [workspaceRoot],
      },
      port: desktopRendererPort,
      strictPort: true,
    },

    esbuild: {
      jsx: "automatic",
    },
  };
});
