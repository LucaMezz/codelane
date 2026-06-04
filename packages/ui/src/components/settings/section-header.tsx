import * as React from "react";

import { Separator } from "#components/shadcn-ui/separator";
import { cn } from "#utils/cn";

interface SettingsSectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

function SettingsSectionHeader({ title, description, className }: SettingsSectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      <Separator className="mt-4" />
    </div>
  );
}

export { SettingsSectionHeader };
export type { SettingsSectionHeaderProps };
