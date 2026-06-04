import { createLocalHttpUrl, defaultPorts } from "@codelane/config/client";

import { configStore } from "./config-store";

export function resolveAuthUrls(options?: { apiUrl?: string; webUrl?: string }): {
  apiUrl: string;
  webUrl: string;
} {
  const config = configStore.get();

  return {
    apiUrl:
      options?.apiUrl ??
      process.env.CODELANE_API_URL ??
      config.apiUrl ??
      createLocalHttpUrl({ port: defaultPorts.api }),
    webUrl:
      options?.webUrl ??
      process.env.CODELANE_WEB_URL ??
      config.webUrl ??
      createLocalHttpUrl({ port: defaultPorts.web }),
  };
}
