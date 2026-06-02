import { ThemeProvider } from "@appkit/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from ".";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}
