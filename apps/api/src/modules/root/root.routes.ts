import { Router } from "express";

import { sessionInfo } from "./root.controller";

export const rootRoutes = Router();

rootRoutes.get("/", sessionInfo);
