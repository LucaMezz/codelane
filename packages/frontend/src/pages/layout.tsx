import { signOut } from "@codelane/api-client";
import { getInitials } from "@codelane/core";
import { AppBreadcrumbs, AppSidebarActions, DashboardShell, toast } from "@codelane/ui";
import { GalleryVerticalEnd } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuthSession } from "../components/auth/auth-session-provider";
import { AppNavigation } from "../components/nav/app-navigation";
import { useFrontendRuntimeConfig } from "../config";

const CODELANE_TEAMS = [
  {
    name: "CodeLane",
    logo: GalleryVerticalEnd,
    plan: "Workspace",
  },
];

export function AppLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const config = useFrontendRuntimeConfig();
  const { clearSession, user } = useAuthSession();
  const displayName = user?.name?.trim() || user?.email?.trim();
  const sidebarUser = user ? { ...user, initials: getInitials(displayName) } : null;

  const actions: AppSidebarActions = {
    user: {
      onSignOut: async () => {
        let result;
        try {
          result = await signOut({ apiBaseUrl: config.apiBaseUrl, redirectTo: "/" });
        } catch {
          toast.error("Could not reach the server. Please try again.");
          return;
        }
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        clearSession();
        void navigate(result.redirectTo, { replace: true });
      },
      onNavigateToProfile: () => void navigate("/profile"),
      onNavigateToSettings: () => void navigate("/settings"),
      onNavigateToPreferences: () => void navigate("/settings?tab=preferences"),
    },
  };

  return (
    <DashboardShell
      actions={actions}
      breadcrumbs={<AppBreadcrumbs collapseAfter={3} />}
      user={sidebarUser}
      teams={CODELANE_TEAMS}
      navContent={<AppNavigation />}
    >
      <Outlet />
    </DashboardShell>
  );
}
