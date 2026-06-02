import { Router } from "express";

import { getHealth } from "./health.controller";

export const healthRoutes = Router();

healthRoutes.get("/", getHealth);
