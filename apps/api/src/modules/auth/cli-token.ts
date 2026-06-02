import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const accessTokenTtlMs = 15 * 60 * 1000;

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createAccessToken(input: { userId: string; sessionId: string; secret: string }): {
  accessToken: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + accessTokenTtlMs);
  const payload = base64Url(
    JSON.stringify({
      sub: input.userId,
      sid: input.sessionId,
      exp: Math.floor(expiresAt.getTime() / 1000),
    }),
  );
  const signature = sign(payload, input.secret);

  return {
    accessToken: `${payload}.${signature}`,
    expiresAt,
  };
}

export function verifyAccessToken(
  token: string,
  secret: string,
): { userId: string; sessionId: string } | null {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload, secret);
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  let data: {
    sub?: string;
    sid?: string;
    exp?: number;
  };

  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as typeof data;
  } catch {
    return null;
  }

  if (!data.sub || !data.sid || !data.exp || data.exp * 1000 <= Date.now()) {
    return null;
  }

  return {
    userId: data.sub,
    sessionId: data.sid,
  };
}

export function verifyPkceChallenge(codeVerifier: string, codeChallenge: string): boolean {
  const challenge = createHash("sha256").update(codeVerifier).digest().toString("base64url");

  return challenge === codeChallenge;
}
