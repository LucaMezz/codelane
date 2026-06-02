import { Spinner } from "@appkit/ui";

export function LoadingScreen(): React.JSX.Element {
  return (
    <div className="flex h-full min-h-48 w-full items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
