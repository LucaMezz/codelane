import type { Command } from "commander";

import { configStore } from "../auth/config-store";
import { createCredentialStore } from "../auth/credential-store";
import { TokenManager } from "../auth/token-manager";
import { resolveAuthUrls } from "../auth/urls";

export function authStatus(program: Command) {
  const auth = program.command("auth").description("Manage CLI authentication.");

  auth
    .command("status")
    .description("Show CLI authentication status.")
    .action(async () => {
      const { apiUrl, webUrl } = resolveAuthUrls();
      const tokenManager = new TokenManager({
        apiUrl,
        credentialStore: createCredentialStore(),
      });
      const me = await tokenManager.getCurrentUser();
      const config = configStore.get();

      console.info(`API URL: ${apiUrl}`);
      console.info(`Web URL: ${webUrl}`);
      console.info(`Authenticated: ${me ? "yes" : "no"}`);

      if (me) {
        console.info(
          `User: ${me.user.name ?? config.userName ?? "Unknown user"} <${me.user.email ?? config.userEmail ?? "unknown"}>`,
        );
      }
    });
}
