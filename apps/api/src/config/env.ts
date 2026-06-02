import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseServerEnv } from "@appkit/config/server";
import { config as loadDotenv } from "dotenv";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(configDir, "../../../..");

loadDotenv({
  path: path.resolve(workspaceRoot, ".env"),
  quiet: true,
});

export const env = parseServerEnv(process.env);
