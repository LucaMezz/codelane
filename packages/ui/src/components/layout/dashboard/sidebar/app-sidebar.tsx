"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "#shadcn/sidebar";

import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export interface AppSidebarActions {
  user: {
    onSignOut: () => void | Promise<void>;
    onNavigateToProfile?: () => void;
    onNavigateToSettings?: () => void;
    onNavigateToPreferences?: () => void;
  };
}

export interface AppSidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  initials?: string | null;
}

export interface AppSidebarTeam {
  name: string;
  logo: React.ElementType;
  plan: string;
}

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  actions: AppSidebarActions;
  user?: AppSidebarUser | null;
  /** Nav sections to render in the sidebar content area. */
  navContent?: React.ReactNode;
  /** Workspaces/teams shown in the header switcher. */
  teams?: AppSidebarTeam[];
}

function getDisplayUser(user?: AppSidebarUser | null) {
  const email = user?.email?.trim() || "Signed in";
  const name = user?.name?.trim() || email;

  return {
    name,
    email,
    avatar: user?.image,
    initials: user?.initials?.trim() || "U",
  };
}

export function AppSidebar({ actions, user, navContent, teams = [], ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {teams.length > 0 && (
        <SidebarHeader>
          <TeamSwitcher teams={teams} />
        </SidebarHeader>
      )}
      <SidebarContent>{navContent}</SidebarContent>
      <SidebarFooter>
        <NavUser
          user={getDisplayUser(user)}
          onSignOut={actions.user.onSignOut}
          onNavigateToProfile={actions.user.onNavigateToProfile}
          onNavigateToSettings={actions.user.onNavigateToSettings}
          onNavigateToPreferences={actions.user.onNavigateToPreferences}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
