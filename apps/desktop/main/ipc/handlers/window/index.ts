import { BrowserWindow } from "electron";

export const getActiveWindow = (): BrowserWindow | null => {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null;
};
