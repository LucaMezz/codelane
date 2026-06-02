import { MacWindowControls } from "./macos";
import { WindowsWindowControls } from "./windows";

export const WindowControls = () => {
  const platform = window.desktopApi?.platform;

  if (platform === "darwin") {
    return <MacWindowControls />;
  }

  return <WindowsWindowControls />;
};
