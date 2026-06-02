export function trimTrailingSlash(url: string): string {
  let endIndex = url.length;

  while (endIndex > 0 && url[endIndex - 1] === "/") {
    endIndex -= 1;
  }

  return url.slice(0, endIndex);
}

export function joinUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export function createLocalHttpUrl(options: { host?: string; port: number }): string {
  return `http://${options.host ?? "localhost"}:${options.port}`;
}
