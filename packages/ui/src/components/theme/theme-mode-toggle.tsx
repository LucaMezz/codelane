import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "#shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "#shadcn/dropdown-menu";
import { cn } from "#utils/cn";

import { ThemeMode, useTheme } from "./theme-provider";

const modeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System",
} satisfies Record<ThemeMode, string>;

type ThemeModeToggleProps = {
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

export function ThemeModeToggle({ className, size = "icon-sm" }: ThemeModeToggleProps) {
  const { mode, resolvedMode, setMode } = useTheme();
  const Icon = resolvedMode === "dark" ? MoonIcon : SunIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Theme: ${modeLabels[mode]}`}
          className={cn(className)}
          size={size}
          title={`Theme: ${modeLabels[mode]}`}
          type="button"
          variant="ghost"
        >
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={mode} onValueChange={(value) => setMode(value as ThemeMode)}>
          <DropdownMenuRadioItem value="light">
            <SunIcon className="size-4" />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <MoonIcon className="size-4" />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <MonitorIcon className="size-4" />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
