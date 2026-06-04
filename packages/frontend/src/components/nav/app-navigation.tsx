import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@codelane/ui";
import { Inbox, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useMatch } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match sub-paths too (e.g. /inbox/123 still highlights Inbox) */
  end?: boolean;
}

const MY_WORK_NAV: NavItem[] = [
  { label: "Inbox", to: "/inbox", icon: Inbox, end: true },
  { label: "My Work", to: "/my-work", icon: ListTodo, end: false },
];

function AppNavItem({ item }: { item: NavItem }) {
  const match = useMatch({ path: item.to, end: item.end ?? true });
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={!!match} tooltip={item.label}>
        <Link to={item.to}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppNavigation() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>My Work</SidebarGroupLabel>
      <SidebarMenu>
        {MY_WORK_NAV.map((item) => (
          <AppNavItem key={item.to} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
