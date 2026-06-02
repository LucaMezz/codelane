import { joinUrl } from "@appkit/config/client";

import { fetchWithTimeout } from "../request";
import { ApiClientOptions, SignOutResult } from "./types";

export async function signOut(
  options: ApiClientOptions & {
    redirectTo?: string;
  },
): Promise<SignOutResult> {
  const redirectTo = options.redirectTo ?? "/auth/login";

  const csrfResponse = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/csrf"), {
    credentials: "include",
  });

  if (!csrfResponse.ok) {
    return {
      success: false,
      error: "unknown",
      message: "Could not start sign out. Please try again.",
    };
  }

  const { csrfToken } = (await csrfResponse.json()) as {
    csrfToken: string;
  };

  const signOutResponse = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/signout"), {
    method: "POST",
    credentials: "include",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: joinUrl(options.apiBaseUrl, "/auth/session"),
    }),
  });

  if (!signOutResponse.ok && signOutResponse.type !== "opaqueredirect") {
    return {
      success: false,
      error: "unknown",
      message: "Could not complete sign out. Please try again.",
    };
  }

  return {
    success: true,
    redirectTo,
  };
}
