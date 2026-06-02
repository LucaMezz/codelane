import { joinUrl } from "@appkit/config/client";

import { fetchWithTimeout } from "../request";
import { ApiClientOptions, AuthSession } from "./types";

export async function fetchAuthSession(options: ApiClientOptions): Promise<AuthSession> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/session"), {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const session = (await response.json()) as AuthSession;

  return session?.user ? session : null;
}
