import { ThemeModeToggle, TooltipProvider } from "@appkit/ui";
import { Outlet } from "react-router-dom";

export function Layout(): React.JSX.Element {
  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-12 shrink-0 items-center justify-end border-b px-4">
          <ThemeModeToggle />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-0 h-[calc(100vh-49px)] w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
