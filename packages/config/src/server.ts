import { z } from "zod";

import { defaultCorsOrigins, defaultPorts } from "./defaults";

const rawServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.string().optional(),
  PORT: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
});

const normalizedServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  API_PORT: z.coerce.number().int().positive(),
  PORT: z.coerce.number().int().positive(),
  CORS_ORIGINS: z.string().transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
  CORS_ORIGIN: z.string(),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof normalizedServerEnvSchema>;

export function parseServerEnv(env: Record<string, string | undefined>): ServerEnv {
  const rawEnv = rawServerEnvSchema.parse(env);
  const apiPort = rawEnv.API_PORT ?? rawEnv.PORT ?? String(defaultPorts.api);
  const corsOrigins = rawEnv.CORS_ORIGINS ?? rawEnv.CORS_ORIGIN ?? defaultCorsOrigins.join(",");

  return normalizedServerEnvSchema.parse({
    ...rawEnv,
    API_PORT: apiPort,
    PORT: apiPort,
    CORS_ORIGINS: corsOrigins,
    CORS_ORIGIN: corsOrigins,
  });
}

export { defaultCorsOrigins, defaultHosts, defaultLocalOrigins, defaultPorts } from "./defaults";
export { envNames } from "./env-names";
export { createLocalHttpUrl, joinUrl, trimTrailingSlash } from "./urls";
