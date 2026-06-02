import { cn } from "@appkit/ui";
import type { HTMLAttributes, ReactNode } from "react";

type TitleBarProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export const TitleBar = ({ children, className, ...props }: TitleBarProps) => {
  return (
    <div
      className={cn(
        "w-full border-b border-border bg-background/50 flex justify-around items-center",
        className,
      )}
      style={{
        WebkitAppRegion: "drag",
      }}
      {...props}
    >
      {children}
    </div>
  );
};
