import { Toaster } from "@codelane/ui";
import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";

import { About } from "#pages/about/index";
import { Login } from "#pages/auth/login";
import { SignUp } from "#pages/auth/sign-up";
import { CliLogin } from "#pages/cli/login";
import { ErrorBoundary } from "#pages/error-boundary";
import { InboxPage } from "#pages/inbox/index";
import { AppLayout } from "#pages/layout";
import { ProfileViewPage } from "#pages/profile/index";
import { SettingsPage } from "#pages/settings/index";

import { AuthSessionProvider } from "./components/auth/auth-session-provider";
import { GuestOnlyRoute } from "./components/auth/guest-only-route";
import { ProtectedRoute } from "./components/auth/protected-route";
import { FrontendRuntimeConfigProvider, type FrontendRuntimeConfig } from "./config";
import { RootRedirect } from "./pages/home";

export function createRoutes(rootLayout: ReactNode, config: FrontendRuntimeConfig): RouteObject[] {
  return [
    {
      path: "/",
      element: (
        <FrontendRuntimeConfigProvider config={config}>
          <AuthSessionProvider>
            {rootLayout}
            <Toaster richColors />
          </AuthSessionProvider>
        </FrontendRuntimeConfigProvider>
      ),
      errorElement: <ErrorBoundary />,
      children: [
        { index: true, element: <RootRedirect /> },
        { path: "about", element: <About /> },
        { path: "cli/login", element: <CliLogin /> },
        {
          element: <ProtectedRoute />,
          children: [
            {
              element: <AppLayout />,
              children: [
                { path: "inbox", element: <InboxPage /> },
                { path: "profile", element: <ProfileViewPage /> },
                { path: "profile/:userId", element: <ProfileViewPage /> },
                { path: "settings", element: <SettingsPage /> },
              ],
            },
          ],
        },
        {
          element: <GuestOnlyRoute />,
          children: [
            {
              path: "auth",
              children: [
                { path: "login", element: <Login /> },
                { path: "sign-up", element: <SignUp /> },
              ],
            },
          ],
        },
      ],
    },
  ];
}
