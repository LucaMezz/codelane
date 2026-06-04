import { CheckCircle2, MessageSquare, Plus, UserCheck, type LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "#utils/cn";

export type ActivityEventType = "created" | "resolved" | "commented" | "assigned";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  workspace: string;
  time: string;
}

export interface ActivityConfig {
  icon: LucideIcon;
  color: string;
  verb: string;
}

export const DEFAULT_ACTIVITY_CONFIG: Record<ActivityEventType, ActivityConfig> = {
  created: {
    icon: Plus,
    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    verb: "Opened",
  },
  resolved: {
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
    verb: "Resolved",
  },
  commented: {
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    verb: "Commented on",
  },
  assigned: {
    icon: UserCheck,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",
    verb: "Was assigned",
  },
};

interface ActivityItemProps {
  item: ActivityEvent;
  /** Override config for specific activity types. Merged with defaults. */
  config?: Partial<Record<ActivityEventType, ActivityConfig>>;
  className?: string;
}

function ActivityItem({ item, config, className }: ActivityItemProps) {
  const merged = { ...DEFAULT_ACTIVITY_CONFIG, ...config };
  const entry = merged[item.type];
  const Icon = entry.icon;

  return (
    <div className={cn("flex items-start gap-3 bg-card px-4 py-3", className)}>
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          entry.color,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="text-muted-foreground">{entry.verb} </span>
          <span className="font-medium">{item.title}</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.workspace} · {item.time}
        </p>
      </div>
    </div>
  );
}

export { ActivityItem };
