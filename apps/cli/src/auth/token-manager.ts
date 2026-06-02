import { getCurrentUser, refreshCliAccessToken } from "@appkit/api-client";

import type { CredentialStore } from "./credential-store";

type AccessTokenState = {
  token: string;
  expiresAt: number;
};

export class TokenManager {
  private accessToken: AccessTokenState | null = null;

  constructor(
    private readonly options: {
      apiUrl: string;
      credentialStore: CredentialStore;
    },
  ) {}

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken && this.accessToken.expiresAt - Date.now() > 30_000) {
      return this.accessToken.token;
    }

    const refreshToken = await this.options.credentialStore.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    const refreshed = await refreshCliAccessToken(
      { refreshToken },
      { apiBaseUrl: this.options.apiUrl },
    );

    if (refreshed.refreshToken) {
      await this.options.credentialStore.setRefreshToken(refreshed.refreshToken);
    }

    this.accessToken = {
      token: refreshed.accessToken,
      expiresAt: Date.parse(refreshed.expiresAt),
    };

    return refreshed.accessToken;
  }

  async getCurrentUser() {
    const token = await this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      return await getCurrentUser(token, { apiBaseUrl: this.options.apiUrl });
    } catch {
      this.accessToken = null;
      const retryToken = await this.getAccessToken();
      return retryToken ? getCurrentUser(retryToken, { apiBaseUrl: this.options.apiUrl }) : null;
    }
  }
}
