import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export interface CredentialStore {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  deleteRefreshToken(): Promise<void>;
}

const fallbackDir = path.join(os.homedir(), ".config", "appkit");
const fallbackPath = path.join(fallbackDir, "cli-credentials.json");

export class FileCredentialStore implements CredentialStore {
  async getRefreshToken(): Promise<string | null> {
    try {
      const content = await fs.readFile(fallbackPath, "utf8");
      const data = JSON.parse(content) as { refreshToken?: string };
      return data.refreshToken ?? null;
    } catch {
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    await fs.mkdir(fallbackDir, { recursive: true });
    await fs.writeFile(fallbackPath, JSON.stringify({ refreshToken: token }, null, 2), {
      mode: 0o600,
    });
  }

  async deleteRefreshToken(): Promise<void> {
    await fs.rm(fallbackPath, { force: true });
  }
}

export function createCredentialStore(): CredentialStore {
  return new FileCredentialStore();
}

export const credentialStoreWarning =
  "Using filesystem credential storage fallback. For production, configure an OS keychain-backed CredentialStore.";
