import { getSession } from "@auth/express";
import type { RequestHandler, Response } from "express";

import { expressAuthConfig } from "#api/lib/auth.config";

import { cliAuthService } from "./cli-auth.service";

function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

export const authorizeCli: RequestHandler = async (req, res, next) => {
  try {
    const session = await getSession(req, expressAuthConfig);
    const userId = session?.user?.id;

    if (!userId) {
      sendError(res, 401, "You must be signed in to authorize the CLI.");
      return;
    }

    res.json(await cliAuthService.authorize(req.body, userId));
  } catch (error) {
    next(error);
  }
};

export const exchangeCliToken: RequestHandler = async (req, res, next) => {
  try {
    res.json(await cliAuthService.token(req.body, req.get("user-agent")));
  } catch (error) {
    void next;
    sendError(res, 400, error instanceof Error ? error.message : "Invalid authorization code.");
  }
};

export const refreshCliToken: RequestHandler = async (req, res, next) => {
  try {
    res.json(await cliAuthService.refresh(req.body));
  } catch (error) {
    void next;
    sendError(res, 401, error instanceof Error ? error.message : "Invalid refresh token.");
  }
};

export const revokeCliToken: RequestHandler = async (req, res, next) => {
  try {
    res.json(await cliAuthService.revoke(req.body));
  } catch (error) {
    next(error);
  }
};

export const getCliMe: RequestHandler = async (req, res) => {
  try {
    res.json(await cliAuthService.me(req.get("authorization")));
  } catch {
    sendError(res, 401, "Unauthorized.");
  }
};
