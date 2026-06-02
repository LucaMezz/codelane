import { Router } from "express";

import { requireAuth } from "#api/middleware/require-auth.middleware";

import { listUsers, registerUser } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.get("/", requireAuth, listUsers);
usersRoutes.post("/", registerUser);
