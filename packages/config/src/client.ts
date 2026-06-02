import { defaultLocalOrigins } from "./defaults";

export type ClientRuntimeConfig = {
  apiBaseUrl: string;
};

export function createClientRuntimeConfig(input: { apiBaseUrl?: string }): ClientRuntimeConfig {
  return {
    apiBaseUrl: input.apiBaseUrl ?? defaultLocalOrigins.api,
  };
}

export { defaultCorsOrigins, defaultHosts, defaultLocalOrigins, defaultPorts } from "./defaults";
export { envNames } from "./env-names";
export { createLocalHttpUrl, joinUrl, trimTrailingSlash } from "./urls";
