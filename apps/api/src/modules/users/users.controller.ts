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
