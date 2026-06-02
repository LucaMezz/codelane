import { createHash, randomBytes } from "node:crypto";

function base64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export function createRandomState(): string {
  return base64Url(randomBytes(32));
}

export function createPkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = base64Url(randomBytes(64));
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  return {
    codeVerifier,
    codeChallenge,
  };
}

export function verifyState(expected: string, actual: string | null): void {
  if (!actual || actual !== expected) {
    throw new Error("State mismatch. Login was cancelled for your safety.");
  }
}
