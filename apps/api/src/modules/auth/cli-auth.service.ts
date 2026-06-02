import {
  CliAuthorizeRequest,
  CliRefreshRequest,
  CliRevokeRequest,
  CliTokenRequest,
  cliAuthorizeRequestSchema,
  cliRefreshRequestSchema,
  cliRevokeRequestSchema,
  cliTokenRequestSchema,
} from "@appkit/core";
import { and, eq, isNull } from "drizzle-orm";

import { env } from "#api/config/env";
import { db } from "#api/db/index";
import { cliAuthorizationCodes, cliSessions, users } from "#api/db/schema/index";

import {
  createAccessToken,
  randomToken,
  sha256,
  verifyAccessToken,
  verifyPkceChallenge,
} from "./cli-token";

const authorizationCodeTtlMs = 5 * 60 * 1000;
const refreshTokenTtlMs = 30 * 24 * 60 * 60 * 1000;

function toUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export const cliAuthService = {
  async authorize(input: CliAuthorizeRequest, userId: string) {
    const data = cliAuthorizeRequestSchema.parse(input);
    const code = randomToken(48);

    await db.insert(cliAuthorizationCodes).values({
      codeHash: sha256(code),
      userId,
      codeChallenge: data.codeChallenge,
      redirectUri: data.redirectUri,
      state: data.state,
      expiresAt: new Date(Date.now() + authorizationCodeTtlMs),
    });

    return {
      code,
      redirectUri: data.redirectUri,
      state: data.state,
    };
  },

  async token(input: CliTokenRequest, userAgent: string | undefined) {
    const data = cliTokenRequestSchema.parse(input);
    const codeHash = sha256(data.code);
    const code = await db.query.cliAuthorizationCodes.findFirst({
      where: eq(cliAuthorizationCodes.codeHash, codeHash),
    });

    if (!code || code.consumedAt || code.expiresAt <= new Date()) {
      throw new Error("Authorization code is invalid or expired.");
    }

    if (code.redirectUri !== data.redirectUri) {
      throw new Error("Redirect URI does not match authorization code.");
    }

    if (!verifyPkceChallenge(data.codeVerifier, code.codeChallenge)) {
      throw new Error("PKCE verification failed.");
    }

    await db
      .update(cliAuthorizationCodes)
      .set({ consumedAt: new Date() })
      .where(eq(cliAuthorizationCodes.id, code.id));

    const refreshToken = randomToken(48);
    const [session] = await db
      .insert(cliSessions)
      .values({
        userId: code.userId,
        refreshTokenHash: sha256(refreshToken),
        name: "AppKit CLI",
        userAgent,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + refreshTokenTtlMs),
      })
      .returning();

    const user = await getUserById(code.userId);
    const access = createAccessToken({
      userId: code.userId,
      sessionId: session.id,
      secret: env.AUTH_SECRET,
    });

    return {
      accessToken: access.accessToken,
      refreshToken,
      expiresAt: access.expiresAt.toISOString(),
      user: toUser(user),
    };
  },

  async refresh(input: CliRefreshRequest) {
    const data = cliRefreshRequestSchema.parse(input);
    const now = new Date();
    const session = await db.query.cliSessions.findFirst({
      where: and(
        eq(cliSessions.refreshTokenHash, sha256(data.refreshToken)),
        isNull(cliSessions.revokedAt),
      ),
    });

    if (!session || session.expiresAt <= now) {
      throw new Error("Refresh token is invalid or expired.");
    }

    const rotatedRefreshToken = randomToken(48);
    await db
      .update(cliSessions)
      .set({
        refreshTokenHash: sha256(rotatedRefreshToken),
        lastUsedAt: now,
      })
      .where(eq(cliSessions.id, session.id));

    const user = await getUserById(session.userId);
    const access = createAccessToken({
      userId: session.userId,
      sessionId: session.id,
      secret: env.AUTH_SECRET,
    });

    return {
      accessToken: access.accessToken,
      refreshToken: rotatedRefreshToken,
      expiresAt: access.expiresAt.toISOString(),
      user: toUser(user),
    };
  },

  async revoke(input: CliRevokeRequest) {
    const data = cliRevokeRequestSchema.parse(input);
    await db
      .update(cliSessions)
      .set({ revokedAt: new Date() })
      .where(eq(cliSessions.refreshTokenHash, sha256(data.refreshToken)));

    return { revoked: true };
  },

  async me(authorizationHeader: string | undefined) {
    const token = authorizationHeader?.match(/^Bearer (.+)$/)?.[1];
    const claims = token ? verifyAccessToken(token, env.AUTH_SECRET) : null;

    if (!claims) {
      throw new Error("Unauthorized.");
    }

    const session = await db.query.cliSessions.findFirst({
      where: and(eq(cliSessions.id, claims.sessionId), isNull(cliSessions.revokedAt)),
    });

    if (!session || session.userId !== claims.userId || session.expiresAt <= new Date()) {
      throw new Error("Unauthorized.");
    }

    const user = await getUserById(claims.userId);

    return { user: toUser(user) };
  },
};
