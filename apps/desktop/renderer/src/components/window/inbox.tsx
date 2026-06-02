import { Button } from "@appkit/ui";
import { MdInbox } from "react-icons/md";

export function Inbox(): React.JSX.Element {
  return (
    <Button variant="ghost" size="icon-titlebar" style={{ WebkitAppRegion: "no-drag" }}>
      <MdInbox />
    </Button>
  );
}
