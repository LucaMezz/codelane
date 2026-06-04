import * as React from "react";

import { Badge } from "#components/shadcn-ui/badge";
import { cn } from "#utils/cn";

export type WorkspaceRole = "Owner" | "Admin" | "Member";

const ROLE_CLASSES: Record<string, string> = {
  Owner: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  Admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  Member: "bg-secondary text-secondary-foreground",
};

interface RoleBadgeProps {
  role: WorkspaceRole | string;
  className?: string;
}

function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge variant="ghost" className={cn("rounded-full text-xs", ROLE_CLASSES[role], className)}>
      {role}
    </Badge>
  );
}

export { RoleBadge };
