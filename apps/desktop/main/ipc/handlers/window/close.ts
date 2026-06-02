import { IpcMainListener } from "#shared/ipc/types";

import { getActiveWindow } from ".";

export const closeWindow = (() => {
  const window = getActiveWindow();
  if (window) {
    window.close();
  }
}) satisfies IpcMainListener;
