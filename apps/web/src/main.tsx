import { ThemeProvider } from "@appkit/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";

import "./styles/globals.css";

const rootElement = document.querySelector("#root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
