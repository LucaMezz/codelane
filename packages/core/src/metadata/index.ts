export const appMetadata = {
  name: "AppKit",
  slug: "appkit",
  author: {
    name: "Luca Mezzavilla",
  },
  version: "0.1.0",
  description:
    "A scalable full-stack monorepo starter kit for building multi-app systems with shared UI, backend APIs, and cross-platform frontends.",
  license: "Apache-2.0",
  repository: {
    owner: "LucaMezz",
    name: "electron-boilerplate",
    url: "https://github.com/LucaMezz/electron-boilerplate",
  },
  apps: {
    desktop: {
      appName: "appkit-desktop",
      executableName: "appkit-desktop",
      bundleId: "com.appkit.desktop",
      category: "public.app-category.developer-tools",
    },
    cli: {
      binaryName: "appkit",
      description: "Command-line client for interacting with the AppKit backend API.",
    },
  },
} as const;
