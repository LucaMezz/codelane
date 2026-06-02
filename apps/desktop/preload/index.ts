import { contextBridge, ipcRenderer } from "electron";

import { IPC_CHANNELS, IpcChannel } from "#shared/ipc/types";

export type AllowedChannel = IpcChannel;

const api = {
  platform: process.platform,

  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),

    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),

    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
  },

  storage: {},
};

export type DesktopApi = typeof api;

contextBridge.exposeInMainWorld("desktopApi", api);

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}
