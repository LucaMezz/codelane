import { Router } from "express";

import { listUsers, registerUser } from "./users.controller";

export const usersRoutes = Router();

usersRoutes.get("/", listUsers);
usersRoutes.post("/", registerUser);
