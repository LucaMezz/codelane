import * as React from "react";

import { cn } from "#utils/cn";

interface SectionHeadingProps {
  /** Optional icon rendered to the left of the title. */
  icon?: React.ElementType;
  title: string;
  /** When provided, renders a count pill next to the title. */
  count?: number;
  className?: string;
}

function SectionHeading({ icon: Icon, title, count, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      <h2 className="text-sm font-semibold">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  );
}

export { SectionHeading };
export type { SectionHeadingProps };
