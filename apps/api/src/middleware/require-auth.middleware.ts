import { getSession } from "@auth/express";
import type { NextFunction, Request, Response } from "express";

import { expressAuthConfig } from "#api/lib/auth.config";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = res.locals.session ?? (await getSession(req, expressAuthConfig));
  if (!session?.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
