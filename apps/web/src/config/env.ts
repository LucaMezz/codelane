import { createClientRuntimeConfig, envNames } from "@appkit/config/client";

export const env = createClientRuntimeConfig({
  apiBaseUrl: import.meta.env[envNames.apiBaseUrl],
});
