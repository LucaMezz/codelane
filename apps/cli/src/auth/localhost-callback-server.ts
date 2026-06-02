import http from "node:http";

export type CallbackResult = {
  code: string;
  state: string;
};

export async function waitForLocalhostCallback(): Promise<{
  redirectUri: string;
  waitForCallback: Promise<CallbackResult>;
  close: () => Promise<void>;
}> {
  const server = http.createServer();

  const waitForCallback = new Promise<CallbackResult>((resolve, reject) => {
    server.on("request", (req, res) => {
      try {
        const url = new URL(req.url ?? "/", "http://127.0.0.1");

        if (url.pathname !== "/callback") {
          res.writeHead(404);
          res.end("Not found.");
          return;
        }

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        if (!code || !state) {
          res.writeHead(400);
          res.end("Authorization failed. You can close this tab.");
          reject(new Error("Authorization callback did not include a code and state."));
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<p>AppKit CLI login complete. You can close this tab.</p>");
        resolve({ code, state });
      } catch (error) {
        reject(error);
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not start localhost callback server.");
  }

  return {
    redirectUri: `http://127.0.0.1:${address.port}/callback`,
    waitForCallback,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}
