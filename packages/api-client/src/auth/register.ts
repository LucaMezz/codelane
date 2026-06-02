import { joinUrl } from "@appkit/config/client";
import { RegisterInput } from "@appkit/core";

import { fetchWithTimeout } from "../request";
import { ApiClientOptions, RegisterUserResult } from "./types";

export async function registerUser(
  input: RegisterInput,
  options: ApiClientOptions,
): Promise<RegisterUserResult> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users"), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as {
    data?: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      emailVerified: Date | string | null;
    };
    error?: {
      message?: string;
    };
  } | null;

  if (response.status === 409) {
    return {
      success: false,
      error: "email_taken",
      message: body?.error?.message ?? "Email is already in use.",
    };
  }

  if (response.status === 400) {
    return {
      success: false,
      error: "validation_error",
      message: body?.error?.message ?? "Invalid registration details.",
    };
  }

  if (!response.ok || !body?.data) {
    return {
      success: false,
      error: "unknown",
      message: body?.error?.message ?? "Registration failed. Please try again.",
    };
  }

  return {
    success: true,
    user: body.data,
  };
}
