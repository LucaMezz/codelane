import type { api } from "#preload/index";

declare global {
  interface Window {
    ipcRenderer: typeof api;
  }
}

export {};
