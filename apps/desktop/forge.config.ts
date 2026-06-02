import path from "node:path";

import { appMetadata } from "@appkit/core/metadata";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

const desktopMetadata = appMetadata.apps.desktop;

const appName = desktopMetadata.appName;
const productName = appMetadata.name;

const assetsPath = path.resolve(__dirname, "assets");
const iconPath = path.resolve(assetsPath, "icon");

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,

    // Important:
    // Keep this unscoped. Squirrel can break when it tries to use
    // the package name "@appkit/desktop" in generated .nuspec paths.
    name: appName,
    executableName: desktopMetadata.executableName,

    appBundleId: desktopMetadata.bundleId,
    appCategoryType: desktopMetadata.category,

    // Important:
    // Do not include the file extension here.
    // Electron Packager will use:
    // - assets/icon.ico on Windows
    // - assets/icon.icns on macOS
    // - assets/icon.png on Linux where applicable
    icon: iconPath,

    // Copies assets into the packaged app resources directory.
    // Useful if your BrowserWindow also references assets/icon.png at runtime.
    extraResource: [assetsPath],
  },

  rebuildConfig: {},

  makers: [
    new MakerSquirrel({
      name: appName,
      title: productName,
      authors: `${appMetadata.author}`,
      setupExe: `${productName}Setup.exe`,
      setupIcon: path.resolve(assetsPath, "icon.ico"),
      noMsi: true,
    }),

    new MakerZIP({}, ["darwin", "win32"]),

    new MakerRpm({
      options: {
        name: appName,
        productName,
        icon: path.resolve(assetsPath, "icon.png"),
      },
    }),

    new MakerDeb({
      options: {
        name: appName,
        productName,
        icon: path.resolve(assetsPath, "icon.png"),
      },
    }),
  ],

  plugins: [
    new VitePlugin({
      build: [
        {
          entry: "main/index.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "preload/index.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),

    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

// oxlint-disable-next-line import/no-default-export
export default config;
