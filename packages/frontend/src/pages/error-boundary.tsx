import { useId } from "react";
import { useRouteError } from "react-router-dom";

export function ErrorBoundary(): React.JSX.Element {
  const id = useId();
  const error = useRouteError();
  console.error(error);

  return (
    <div id={id} className="space-y-4 p-4">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {(error as { statusText?: string }).statusText || (error as { message?: string }).message}
        </i>
      </p>
    </div>
  );
}
