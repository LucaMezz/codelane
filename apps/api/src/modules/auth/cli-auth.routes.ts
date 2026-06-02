import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  authorizeCli,
  exchangeCliToken,
  getCliMe,
  refreshCliToken,
  revokeCliToken,
} from "./cli-auth.controller";

export const cliAuthRoutes = Router();

const cliAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});

cliAuthRoutes.use(cliAuthLimiter);

cliAuthRoutes.post("/cli/authorize", authorizeCli);
cliAuthRoutes.post("/cli/token", exchangeCliToken);
cliAuthRoutes.post("/cli/refresh", refreshCliToken);
cliAuthRoutes.post("/cli/revoke", revokeCliToken);
cliAuthRoutes.get("/me", getCliMe);
