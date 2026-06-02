import { changePasswordSchema, updatePreferencesSchema, updateProfileSchema } from "@codelane/core";
import type { RequestHandler } from "express";

import { usersService } from "./users.service";

export const listUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await usersService.list();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await usersService.register(req.body);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.session?.user?.id as string;
    const profile = await usersService.getMe(userId);
    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.session?.user?.id as string;
    const parsed = updateProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: { message: parsed.error.errors[0]?.message ?? "Invalid input" } });
      return;
    }

    const profile = await usersService.updateMe(userId, parsed.data);
    res.json({ data: profile });
  } catch (error) {
    next(error);
  }
};

export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.session?.user?.id as string;
    const parsed = changePasswordSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: { message: parsed.error.errors[0]?.message ?? "Invalid input" } });
      return;
    }

    await usersService.changePassword(userId, parsed.data);
    res.json({ data: { success: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "Current password is incorrect") {
      res.status(400).json({ error: { message: error.message } });
      return;
    }
    next(error);
  }
};

export const getPreferences: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.session?.user?.id as string;
    const prefs = await usersService.getPreferences(userId);
    res.json({ data: prefs });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.session?.user?.id as string;
    const parsed = updatePreferencesSchema.safeParse(req.body);

    if (!parsed.success) {
      res
        .status(400)
        .json({ error: { message: parsed.error.errors[0]?.message ?? "Invalid input" } });
      return;
    }

    const prefs = await usersService.updatePreferences(userId, parsed.data);
    res.json({ data: prefs });
  } catch (error) {
    next(error);
  }
};
