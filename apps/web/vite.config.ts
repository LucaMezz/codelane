import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

import { defaultPorts } from "../../packages/config/src/defaults.ts";
import { envNames } from "../../packages/config/src/env-names.ts";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDir, "../..");

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

// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, workspaceRoot, "");
  const webPort = Number(rootEnv[envNames.webPort] ?? defaultPorts.web);

  return {
    envDir: workspaceRoot,

    plugins: [react(), watchWorkspacePackages()],

    resolve: {
      alias: [
        {
          find: "@codelane/config/client",
          replacement: path.resolve(workspaceRoot, "packages/config/src/client.ts"),
        },
        {
          find: "@codelane/config",
          replacement: path.resolve(workspaceRoot, "packages/config/src/index.ts"),
        },
        {
          find: "@codelane/frontend/globals.css",
          replacement: path.resolve(workspaceRoot, "packages/frontend/src/styles/globals.css"),
        },
        {
          find: "@codelane/frontend",
          replacement: path.resolve(workspaceRoot, "packages/frontend/src/index.ts"),
        },
        {
          find: "@codelane/ui/globals.css",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/styles/globals.css"),
        },
        {
          find: "@codelane/ui/client",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/client.ts"),
        },
        {
          find: "@codelane/ui",
          replacement: path.resolve(workspaceRoot, "packages/ui/src/index.ts"),
        },
        {
          find: "@codelane/api-client",
          replacement: path.resolve(workspaceRoot, "packages/api-client/src/index.ts"),
        },
        {
          find: "@codelane/core",
          replacement: path.resolve(workspaceRoot, "packages/core/src/index.ts"),
        },
      ],
      dedupe: ["react", "react-dom"],
    },

    optimizeDeps: {
      include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      exclude: [
        "@codelane/config",
        "@codelane/frontend",
        "@codelane/ui",
        "@codelane/api-client",
        "@codelane/core",
      ],
    },

    server: {
      fs: {
        allow: [workspaceRoot],
      },
      port: webPort,
      strictPort: true,
    },
  };
});
