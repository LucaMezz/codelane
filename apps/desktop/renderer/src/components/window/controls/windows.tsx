import { Button } from "@appkit/ui";
import { HiOutlineMinus } from "react-icons/hi";
import { HiOutlineSquare2Stack, HiXMark } from "react-icons/hi2";

export const WindowsWindowControls = () => {
  return (
    <div className="flex items-center gap-1" style={{ WebkitAppRegion: "no-drag" }}>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-none"
        onClick={() => window.desktopApi?.window.minimize()}
      >
        <HiOutlineMinus size={16} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="rounded-none"
        onClick={() => window.desktopApi?.window.maximize()}
      >
        <HiOutlineSquare2Stack size={16} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="rounded-none hover:bg-destructive/90!"
        onClick={() => window.desktopApi?.window.close()}
      >
        <HiXMark size={16} />
      </Button>
    </div>
  );
};
