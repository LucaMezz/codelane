import { Separator } from "@appkit/ui";
import { ThemeModeToggle } from "@appkit/ui";
import { TooltipProvider } from "@appkit/ui";
import type { CSSProperties } from "react";
import { Outlet } from "react-router-dom";

import { WindowControls } from "#renderer/src/components/window/controls/controls";
import { HistoryControls } from "#renderer/src/components/window/history-controls";
import { Inbox } from "#renderer/src/components/window/inbox";
import { TitleBar } from "#renderer/src/components/window/title-bar";

export function Layout(): React.JSX.Element {
  return (
    <TooltipProvider>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ "--appkit-dashboard-sidebar-offset": "32px" } as CSSProperties}
      >
        <TitleBar className="flex h-8 items-center border-b shrink-0">
          <div className="w-full h-8 flex items-center justify-between px-2">
            <HistoryControls />
            <div className="flex items-center h-full gap-2" style={{ WebkitAppRegion: "no-drag" }}>
              <ThemeModeToggle size="icon-titlebar" />
              <Inbox />
              <Separator orientation="vertical" />
            </div>
          </div>
          <WindowControls />
        </TitleBar>

        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-0 h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
