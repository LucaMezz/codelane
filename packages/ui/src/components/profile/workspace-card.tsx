import { CircleDot, Timer, Users } from "lucide-react";
import * as React from "react";

import { RoleBadge, type WorkspaceRole } from "#components/profile/role-badge";
import { cn } from "#utils/cn";

export interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole | string;
  openIssues: number;
  inProgress: number;
  members: number;
  /** Accent color rendered as a left border stripe. Any valid CSS color. */
  color: string;
}

interface WorkspaceCardProps {
  workspace: Workspace;
  className?: string;
}

function WorkspaceCard({ workspace, className }: WorkspaceCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30",
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: workspace.color }}
      />
      <div className="pl-2">
        <div className="mb-2 flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{workspace.name}</p>
          <RoleBadge role={workspace.role} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <CircleDot className="h-3 w-3" />
            {workspace.openIssues} open
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Timer className="h-3 w-3" />
            {workspace.inProgress} in progress
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Users className="h-3 w-3" />
            {workspace.members}
          </span>
        </div>
      </div>
    </div>
  );
}

export { WorkspaceCard };
