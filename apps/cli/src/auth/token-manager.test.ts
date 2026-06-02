import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CredentialStore } from "./credential-store";
import { TokenManager } from "./token-manager";

const mocks = vi.hoisted(() => ({
  refreshCliAccessToken: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@appkit/api-client", () => ({
  refreshCliAccessToken: mocks.refreshCliAccessToken,
  getCurrentUser: mocks.getCurrentUser,
}));

function createMemoryCredentialStore(token: string | null): CredentialStore & {
  currentToken: () => string | null;
} {
  let refreshToken = token;

  return {
    currentToken: () => refreshToken,
    async getRefreshToken() {
      return refreshToken;
    },
    async setRefreshToken(token) {
      refreshToken = token;
    },
    async deleteRefreshToken() {
      refreshToken = null;
    },
  };
}

describe("TokenManager", () => {
  beforeEach(() => {
    mocks.refreshCliAccessToken.mockReset();
    mocks.getCurrentUser.mockReset();
  });

  it("returns null without a refresh token", async () => {
    const manager = new TokenManager({
      apiUrl: "https://api.example.test",
      credentialStore: createMemoryCredentialStore(null),
    });

    await expect(manager.getAccessToken()).resolves.toBeNull();
  });

  it("refreshes access tokens and stores rotated refresh tokens", async () => {
    const store = createMemoryCredentialStore("refresh-1");
    mocks.refreshCliAccessToken.mockResolvedValue({
      accessToken: "access-1",
      refreshToken: "refresh-2",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: "user-1",
        name: "Luca",
        email: "luca@example.test",
        image: null,
      },
    });

    const manager = new TokenManager({
      apiUrl: "https://api.example.test",
      credentialStore: store,
    });

    await expect(manager.getAccessToken()).resolves.toBe("access-1");
    expect(store.currentToken()).toBe("refresh-2");
  });
});
