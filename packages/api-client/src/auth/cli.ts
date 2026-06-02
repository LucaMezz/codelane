import { joinUrl } from "@appkit/config/client";
import {
  CliAuthorizeRequest,
  CliAuthorizeResponse,
  CliRefreshRequest,
  CliRefreshResponse,
  CliRevokeRequest,
  CliRevokeResponse,
  CliTokenRequest,
  CliTokenResponse,
  MeResponse,
  cliAuthorizeResponseSchema,
  cliRefreshResponseSchema,
  cliRevokeResponseSchema,
  cliTokenResponseSchema,
  meResponseSchema,
} from "@appkit/core";

import { fetchWithTimeout } from "../request";
import { ApiClientOptions } from "./types";

async function postJson<TResponse>(
  url: string,
  body: unknown,
  schema: { parse(value: unknown): TResponse },
  options?: RequestInit,
): Promise<TResponse> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetchWithTimeout(url, {
    method: "POST",
    credentials: options?.credentials,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return schema.parse(await response.json());
}

export function startCliAuthorization(
  input: CliAuthorizeRequest,
  options: ApiClientOptions,
): Promise<CliAuthorizeResponse> {
  return postJson(
    joinUrl(options.apiBaseUrl, "/auth/cli/authorize"),
    input,
    cliAuthorizeResponseSchema,
    { credentials: "include" },
  );
}

export function exchangeCliCode(
  input: CliTokenRequest,
  options: ApiClientOptions,
): Promise<CliTokenResponse> {
  return postJson(joinUrl(options.apiBaseUrl, "/auth/cli/token"), input, cliTokenResponseSchema);
}

export function refreshCliAccessToken(
  input: CliRefreshRequest,
  options: ApiClientOptions,
): Promise<CliRefreshResponse> {
  return postJson(
    joinUrl(options.apiBaseUrl, "/auth/cli/refresh"),
    input,
    cliRefreshResponseSchema,
  );
}

export function revokeCliSession(
  input: CliRevokeRequest,
  options: ApiClientOptions,
): Promise<CliRevokeResponse> {
  return postJson(joinUrl(options.apiBaseUrl, "/auth/cli/revoke"), input, cliRevokeResponseSchema);
}

export async function getCurrentUser(
  accessToken: string,
  options: ApiClientOptions,
): Promise<MeResponse> {
  const response = await fetchWithTimeout(joinUrl(options.apiBaseUrl, "/auth/me"), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  return meResponseSchema.parse(await response.json());
}
