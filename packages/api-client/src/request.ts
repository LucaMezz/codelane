const defaultTimeoutMs = 15_000;

export async function fetchWithTimeout(
  input: Parameters<typeof fetch>[0],
  { timeoutMs = defaultTimeoutMs, ...init }: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
