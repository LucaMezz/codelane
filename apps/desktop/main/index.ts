import path from "node:path";

import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import started from "electron-squirrel-startup";

import { ipcMainListeners } from "./ipc";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

function getAssetPath(...paths: string[]): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "assets", ...paths);
  }

  return path.join(app.getAppPath(), "assets", ...paths);
}

const CONFIG = {
  WINDOW: {
    WIDTH: 800,
    HEIGHT: 600,
    MIN_WIDTH: 800,
    MIN_HEIGHT: 500,
  },
} as const;

let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

app
  .whenReady()
  .then(() => {
    try {
      initializeApp();
    } catch (error) {
      console.error("Failed to initialize application:", error);

      dialog.showErrorBox(
        "Initialization Error",
        `Failed to start the application: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      app.quit();
    }
  })
  .catch((error) => {
    console.error("Fatal error during app initialization:", error);
    app.quit();
  });

function initializeApp(): void {
  registerIpcMainListeners();
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    // and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    cleanup();
    app.quit();
  }
});

app.on("before-quit", () => {
  cleanup();
});

function cleanup(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }

  mainWindow = null;
}

function createWindow(): void {
  const windowIconPath = getAssetPath("icon.png");

  console.info("Using window icon:", windowIconPath);

  mainWindow = new BrowserWindow({
    width: CONFIG.WINDOW.WIDTH,
    height: CONFIG.WINDOW.HEIGHT,
    minWidth: CONFIG.WINDOW.MIN_WIDTH,
    minHeight: CONFIG.WINDOW.MIN_HEIGHT,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    frame: false,
    icon: windowIconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("Renderer failed to load:", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    },
  );

  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    console.error("Renderer process gone:", details);
  });

  loadApplication(mainWindow);

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function loadApplication(window: BrowserWindow): void {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error) => {
      console.error("Failed to load development renderer:", error);

      dialog.showErrorBox(
        "Loading Error",
        "Failed to load the development renderer. Please try restarting.",
      );
    });

    return;
  }

  const rendererPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);

  console.info("Loading packaged renderer from:", rendererPath);

  window.loadFile(rendererPath).catch((error) => {
    console.error("Failed to load packaged renderer:", {
      error,
      rendererPath,
      dirname: __dirname,
      appPath: app.getAppPath(),
    });

    dialog.showErrorBox(
      "Loading Error",
      `Failed to load the packaged renderer from:\n\n${rendererPath}`,
    );
  });
}

function registerIpcMainListeners(): void {
  try {
    for (const [channel, listener] of Object.entries(ipcMainListeners)) {
      ipcMain.handle(channel, listener);
    }

    console.info(`Registered ${Object.keys(ipcMainListeners).length} IPC handlers`);
  } catch (error) {
    console.error("Failed to register IPC listeners:", error);

    throw new Error(
      `Failed to register IPC listeners: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
