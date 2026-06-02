import type { Command } from "commander";

import { createCredentialStore } from "../auth/credential-store";
import { TokenManager } from "../auth/token-manager";
import { resolveAuthUrls } from "../auth/urls";

export function whoami(program: Command) {
  program
    .command("whoami")
    .description("Show the signed-in CLI user.")
    .action(async () => {
      const { apiUrl } = resolveAuthUrls();
      const tokenManager = new TokenManager({
        apiUrl,
        credentialStore: createCredentialStore(),
      });
      const me = await tokenManager.getCurrentUser();

      if (!me) {
        console.info("You are not signed in. Run `appkit login`.");
        return;
      }

      const displayName = me.user.name ?? "Unknown user";
      const email = me.user.email ? ` <${me.user.email}>` : "";
      console.info(`Signed in as ${displayName}${email}`);
    });
}
