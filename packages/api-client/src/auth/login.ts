import { joinUrl } from "@appkit/config/client";

import { fetchWithTimeout } from "../request";
import { ApiClientOptions, SignInResult } from "./types";

export async function signInWithCredentials(
  email: string,
  password: string,
  options: ApiClientOptions & {
    redirectTo?: string;
  },
): Promise<SignInResult> {
  const redirectTo = options.redirectTo ?? "/dashboard";

  const csrfResponse = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/csrf"), {
    credentials: "include",
  });

  if (!csrfResponse.ok) {
    return {
      success: false,
      error: "unknown",
      message: "Could not start sign in. Please try again.",
    };
  }

  const { csrfToken } = (await csrfResponse.json()) as {
    csrfToken: string;
  };

  const callbackUrl = joinUrl(options.apiBaseUrl, "/auth/session");
  const credentialsResponse = await fetchWithTimeout(
    joinUrl(options.apiBaseUrl, "/auth/callback/credentials"),
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        csrfToken,
        email,
        password,
        callbackUrl,
      }),
    },
  );

  if (!credentialsResponse.ok) {
    return {
      success: false,
      error: "unknown",
      message: "Could not complete sign in. Please try again.",
    };
  }

  const sessionResponse = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/session"), {
    credentials: "include",
  });

  if (!sessionResponse.ok) {
    return {
      success: false,
      error: "unknown",
      message: "Could not verify sign in. Please try again.",
    };
  }

  const session = (await sessionResponse.json()) as {
    user?: unknown;
  };

  if (!session?.user) {
    return {
      success: false,
      error: "invalid_credentials",
      message: "Invalid email or password.",
    };
  }

  return {
    success: true,
    redirectTo,
  };
}

export type { SignInResult };
