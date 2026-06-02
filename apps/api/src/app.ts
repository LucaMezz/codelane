import { ExpressAuth } from "@auth/express";
import express from "express";
import helmet from "helmet";

import { errorMiddleware } from "#api/middleware/error.middleware";
import { notFoundMiddleware } from "#api/middleware/not-found.middleware";
import { healthRoutes } from "#api/modules/health/health.routes";
import { usersRoutes } from "#api/modules/users/users.routes";

import { expressAuthConfig } from "./lib/auth.config";
import { corsConfig } from "./lib/cors.config";
import { morganConfig } from "./lib/morgan.config";
import { requireAuth } from "./middleware/require-auth.middleware";
import { cliAuthRoutes } from "./modules/auth/cli-auth.routes";
import { rootRoutes } from "./modules/root/root.routes";

export const app = express();

app.use(helmet());

app.use(corsConfig);

app.use(express.json());
app.use(morganConfig);

const authConfig = expressAuthConfig;

app.use("/", rootRoutes);
app.use("/auth", cliAuthRoutes);
app.use("/auth", ExpressAuth(authConfig));
app.use("/health", healthRoutes);
app.use("/users", requireAuth, usersRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
