import { IpcMainListener } from "#shared/ipc/types";

import { getActiveWindow } from ".";

export const minimizeWindow = (() => {
  const window = getActiveWindow();
  if (window) {
    window.minimize();
  }
}) satisfies IpcMainListener;
