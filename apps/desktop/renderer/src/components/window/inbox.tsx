import { Button } from "@codelane/ui";
import { MdInbox } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export function Inbox(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon-titlebar"
      style={{ WebkitAppRegion: "no-drag" }}
      onClick={() => navigate("/inbox")}
    >
      <MdInbox />
    </Button>
  );
}
