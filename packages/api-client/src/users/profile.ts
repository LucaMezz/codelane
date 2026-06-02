import { joinUrl } from "@codelane/config/client";
import type {
  ChangePasswordInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  UserPreferences,
  UserProfile,
} from "@codelane/core";

import type { ApiClientOptions } from "../auth/types";
import { fetchWithTimeout } from "../request";

export async function getMyProfile(options: ApiClientOptions): Promise<UserProfile> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users/me"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  const body = (await response.json()) as { data: UserProfile };
  return body.data;
}

export type UpdateProfileResult =
  | { success: true; profile: UserProfile }
  | { success: false; message: string };

export async function updateMyProfile(
  input: UpdateProfileInput,
  options: ApiClientOptions,
): Promise<UpdateProfileResult> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users/me"), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as {
    data?: UserProfile;
    error?: { message?: string };
  } | null;

  if (!response.ok || !body?.data) {
    return { success: false, message: body?.error?.message ?? "Failed to update profile." };
  }

  return { success: true, profile: body.data };
}

export type ChangePasswordResult = { success: true } | { success: false; message: string };

export async function changeMyPassword(
  input: ChangePasswordInput,
  options: ApiClientOptions,
): Promise<ChangePasswordResult> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users/me/password"), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as {
    data?: { success: boolean };
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    return { success: false, message: body?.error?.message ?? "Failed to change password." };
  }

  return { success: true };
}

export async function getMyPreferences(options: ApiClientOptions): Promise<UserPreferences> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users/me/preferences"), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to load preferences");
  }

  const body = (await response.json()) as { data: UserPreferences };
  return body.data;
}

export type UpdatePreferencesResult =
  | { success: true; preferences: UserPreferences }
  | { success: false; message: string };

export async function updateMyPreferences(
  input: UpdatePreferencesInput,
  options: ApiClientOptions,
): Promise<UpdatePreferencesResult> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/users/me/preferences"), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = (await response.json().catch(() => null)) as {
    data?: UserPreferences;
    error?: { message?: string };
  } | null;

  if (!response.ok || !body?.data) {
    return { success: false, message: body?.error?.message ?? "Failed to update preferences." };
  }

  return { success: true, preferences: body.data };
}
