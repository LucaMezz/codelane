import { createRoutes } from "@appkit/frontend";
import { createHashRouter, RouterProvider } from "react-router-dom";

import { Layout } from "./components/layout";
import { env } from "./config/env";

import "./styles/globals.css";

const routes = createRoutes(<Layout />, {
  apiBaseUrl: env.apiBaseUrl,
});

const router = createHashRouter(routes);

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
