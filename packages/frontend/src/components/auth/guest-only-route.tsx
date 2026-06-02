import { Navigate, Outlet } from "react-router-dom";

import { LoadingScreen } from "../../pages/loading";
import { useAuthSession } from "./auth-session-provider";

export function GuestOnlyRoute() {
  const { status } = useAuthSession();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
