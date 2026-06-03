import { CircleDot, Timer, Users } from "lucide-react";

import { RoleBadge, type WorkspaceRole } from "./role-badge";

export interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
  openIssues: number;
  inProgress: number;
  members: number;
  color: string;
}

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30">
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
