import { IPC_CHANNELS } from "#shared/ipc/types";

import { closeWindow } from "./handlers/window/close";
import { maximizeWindow } from "./handlers/window/maximize";
import { minimizeWindow } from "./handlers/window/minimize";

export const ipcMainListeners = {
  [IPC_CHANNELS.WINDOW_MINIMIZE]: minimizeWindow,
  [IPC_CHANNELS.WINDOW_MAXIMIZE]: maximizeWindow,
  [IPC_CHANNELS.WINDOW_CLOSE]: closeWindow,
} as const;
