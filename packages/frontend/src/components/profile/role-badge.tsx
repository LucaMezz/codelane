import { Badge, cn } from "@codelane/ui";

export type WorkspaceRole = "Owner" | "Admin" | "Member";

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <Badge
      variant="ghost"
      className={cn(
        "rounded-full text-xs",
        role === "Owner" &&
          "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
        role === "Admin" && "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
        role === "Member" && "bg-secondary text-secondary-foreground",
      )}
    >
      {role}
    </Badge>
  );
}
