import { exchangeCliCode } from "@appkit/api-client";
import { joinUrl } from "@appkit/config/client";
import type { Command } from "commander";

import { configStore } from "../auth/config-store";
import { createCredentialStore, credentialStoreWarning } from "../auth/credential-store";
import { waitForLocalhostCallback } from "../auth/localhost-callback-server";
import { openBrowser } from "../auth/open-browser";
import { createPkcePair, createRandomState, verifyState } from "../auth/pkce";
import { resolveAuthUrls } from "../auth/urls";

export function login(program: Command) {
  program
    .command("login")
    .description("Sign in with browser-based CLI authentication.")
    .option("--no-browser", "Print the login URL instead of opening a browser.")
    .option("--api-url <url>", "API URL to authenticate against.")
    .option("--web-url <url>", "Web app URL to authenticate with.")
    .action(async (options: { browser?: boolean; apiUrl?: string; webUrl?: string }) => {
      const { apiUrl, webUrl } = resolveAuthUrls(options);
      const state = createRandomState();
      const pkce = createPkcePair();
      const callbackServer = await waitForLocalhostCallback();
      const loginUrl = new URL(joinUrl(webUrl, "/cli/login"));

      loginUrl.searchParams.set("state", state);
      loginUrl.searchParams.set("code_challenge", pkce.codeChallenge);
      loginUrl.searchParams.set("redirect_uri", callbackServer.redirectUri);

      console.info(credentialStoreWarning);

      if (options.browser === false) {
        console.info("Open this URL to sign in:");
      } else {
        console.info("Opening browser for login...");
        await openBrowser(loginUrl.toString());
        console.info("If the browser did not open, visit:");
      }

      console.info(loginUrl.toString());
      console.info("Waiting for authorization...");

      try {
        const callback = await callbackServer.waitForCallback;
        verifyState(state, callback.state);

        const tokenResponse = await exchangeCliCode(
          {
            code: callback.code,
            codeVerifier: pkce.codeVerifier,
            redirectUri: callbackServer.redirectUri,
          },
          { apiBaseUrl: apiUrl },
        );

        const credentialStore = createCredentialStore();
        await credentialStore.setRefreshToken(tokenResponse.refreshToken);
        configStore.set({
          apiUrl,
          webUrl,
          userId: tokenResponse.user.id,
          userEmail: tokenResponse.user.email,
          userName: tokenResponse.user.name,
        });

        console.info(`Logged in as ${tokenResponse.user.email ?? tokenResponse.user.id}`);
      } finally {
        await callbackServer.close();
      }
    });
}
