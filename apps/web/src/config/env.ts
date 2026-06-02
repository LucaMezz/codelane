import { createClientRuntimeConfig, envNames } from "@codelane/config/client";

export const env = createClientRuntimeConfig({
  apiBaseUrl: import.meta.env[envNames.apiBaseUrl],
});
