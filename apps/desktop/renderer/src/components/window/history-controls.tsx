import { Button } from "@appkit/ui";
import { Kbd, KbdGroup } from "@appkit/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@appkit/ui";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";

export function HistoryControls() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center space-x-0.5" style={{ WebkitAppRegion: "no-drag" }}>
      <Tooltip>
        <TooltipContent collisionPadding={12}>
          <div className="flex flex-col items-center justify-center gap-1">
            <p>Back</p>
            <KbdGroup>
              <Kbd>Alt</Kbd>
              <Kbd>←</Kbd>
            </KbdGroup>
          </div>
        </TooltipContent>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-titlebar"
            className="rounded-r-none"
            onClick={() => navigate(-1)}
          >
            <GoArrowLeft />
          </Button>
        </TooltipTrigger>
      </Tooltip>
      <Tooltip>
        <TooltipContent collisionPadding={12}>
          <div className="flex flex-col items-center justify-center gap-1">
            <p>Forward</p>
            <KbdGroup>
              <Kbd>Alt</Kbd>
              <Kbd>→</Kbd>
            </KbdGroup>
          </div>
        </TooltipContent>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-titlebar"
            className="rounded-l-none"
            onClick={() => navigate(1)}
          >
            <GoArrowRight />
          </Button>
        </TooltipTrigger>
      </Tooltip>
    </div>
  );
}
