import { signOut } from "@appkit/api-client";
import { getInitials } from "@appkit/core";
import { DashboardShell } from "@appkit/ui";
import { AppSidebarActions } from "@appkit/ui";
import { AppBreadcrumbs } from "@appkit/ui";
import { toast } from "@appkit/ui";
import { Outlet, useNavigate } from "react-router-dom";

import { useAuthSession } from "../../components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "../../config";

export function DashboardLayout(): React.JSX.Element {
  const navigate = useNavigate();
  const config = useFrontendRuntimeConfig();
  const { clearSession, user } = useAuthSession();
  const displayName = user?.name?.trim() || user?.email?.trim();
  const sidebarUser = user
    ? {
        ...user,
        initials: getInitials(displayName),
      }
    : null;

  const actions: AppSidebarActions = {
    user: {
      onSignOut: async () => {
        let result;

        try {
          result = await signOut({
            apiBaseUrl: config.apiBaseUrl,
            redirectTo: "/",
          });
        } catch {
          toast.error("Could not reach the server. Please try again.");
          return;
        }

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        clearSession();
        void navigate(result.redirectTo, {
          replace: true,
        });
      },
    },
  };

  return (
    <DashboardShell
      actions={actions}
      breadcrumbs={<AppBreadcrumbs collapseAfter={3} />}
      user={sidebarUser}
    >
      <Outlet />
    </DashboardShell>
  );
}
