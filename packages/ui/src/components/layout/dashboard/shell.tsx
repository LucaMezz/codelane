import type { ReactNode } from "react";

import { Separator } from "#components/shadcn-ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "#components/shadcn-ui/sidebar";

import { AppSidebar, AppSidebarActions, AppSidebarUser } from "./sidebar";

interface DashboardShellProps {
  actions: AppSidebarActions;
  breadcrumbs?: ReactNode;
  children: ReactNode;
  className?: string;
  user?: AppSidebarUser | null;
}

export function DashboardShell({ actions, breadcrumbs, children, user }: DashboardShellProps) {
  return (
    <SidebarProvider className="flex min-h-0 h-full w-full" defaultOpen>
      <AppSidebar
        className="top-[var(--appkit-dashboard-sidebar-offset,0px)] h-[calc(100svh-var(--appkit-dashboard-sidebar-offset,0px))]"
        actions={actions}
        user={user}
      />

      <SidebarInset className="p-0 m-0">
        <header className="flex h-12 shrink-0 items-center transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
            {breadcrumbs}
          </div>
        </header>

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
