import { Router } from "express";

import { requireAuth } from "#api/middleware/require-auth.middleware";

import {
  changePassword,
  getMe,
  getPreferences,
  getUserById,
  listUsers,
  registerUser,
  updateMe,
  updatePreferences,
} from "./users.controller";

export const usersRoutes = Router();

usersRoutes.get("/", requireAuth, listUsers);
usersRoutes.post("/", registerUser);

usersRoutes.get("/me", requireAuth, getMe);
usersRoutes.get("/:id", requireAuth, getUserById);
usersRoutes.patch("/me", requireAuth, updateMe);
usersRoutes.patch("/me/password", requireAuth, changePassword);
usersRoutes.get("/me/preferences", requireAuth, getPreferences);
usersRoutes.patch("/me/preferences", requireAuth, updatePreferences);
