import { createRoutes } from "@appkit/frontend";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { env } from "./config/env";
import { Layout } from "./layout";

const routes = createRoutes(<Layout />, {
  apiBaseUrl: env.apiBaseUrl,
});

const router = createBrowserRouter(routes);

export function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
