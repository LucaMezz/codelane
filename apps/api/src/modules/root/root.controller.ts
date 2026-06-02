import type { RequestHandler } from "express";

export const sessionInfo: RequestHandler = (_req, res) => {
  const { session } = res.locals;
  res.json({ user: session?.user });
};
