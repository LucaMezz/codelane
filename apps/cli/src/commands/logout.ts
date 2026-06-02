import { revokeCliSession } from "@appkit/api-client";
import type { Command } from "commander";

import { configStore } from "../auth/config-store";
import { createCredentialStore } from "../auth/credential-store";
import { resolveAuthUrls } from "../auth/urls";

export function logout(program: Command) {
  program
    .command("logout")
    .description("Revoke the CLI session and remove local credentials.")
    .action(async () => {
      const { apiUrl } = resolveAuthUrls();
      const credentialStore = createCredentialStore();
      const refreshToken = await credentialStore.getRefreshToken();

      if (refreshToken) {
        try {
          await revokeCliSession({ refreshToken }, { apiBaseUrl: apiUrl });
        } catch {
          // Local cleanup should still succeed if the server is unavailable.
        }
      }

      await credentialStore.deleteRefreshToken();
      configStore.clearUser();
      console.info("Logged out.");
    });
}
