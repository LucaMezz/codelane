import { z } from "zod";

const localhostCallbackUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return (
          url.protocol === "http:" &&
          (url.hostname === "127.0.0.1" || url.hostname === "localhost") &&
          url.pathname === "/callback" &&
          url.port.length > 0
        );
      } catch {
        return false;
      }
    },
    {
      message: "Redirect URI must be a localhost callback URL.",
    },
  );

export const cliAuthorizeRequestSchema = z.object({
  codeChallenge: z.string().min(32),
  redirectUri: localhostCallbackUrlSchema,
  state: z.string().min(16),
});

export const cliAuthorizeResponseSchema = z.object({
  code: z.string().min(32),
  redirectUri: localhostCallbackUrlSchema,
  state: z.string().min(16),
});

export const cliTokenRequestSchema = z.object({
  code: z.string().min(32),
  codeVerifier: z.string().min(43).max(128),
  redirectUri: localhostCallbackUrlSchema,
});

export const cliUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
});

export const cliTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(32),
  expiresAt: z.string().datetime(),
  user: cliUserSchema,
});

export const cliRefreshRequestSchema = z.object({
  refreshToken: z.string().min(32),
});

export const cliRefreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(32).optional(),
  expiresAt: z.string().datetime(),
  user: cliUserSchema,
});

export const cliRevokeRequestSchema = z.object({
  refreshToken: z.string().min(32),
});

export const cliRevokeResponseSchema = z.object({
  revoked: z.boolean(),
});

export const meResponseSchema = z.object({
  user: cliUserSchema,
});

export type CliAuthorizeRequest = z.infer<typeof cliAuthorizeRequestSchema>;
export type CliAuthorizeResponse = z.infer<typeof cliAuthorizeResponseSchema>;
export type CliTokenRequest = z.infer<typeof cliTokenRequestSchema>;
export type CliTokenResponse = z.infer<typeof cliTokenResponseSchema>;
export type CliRefreshRequest = z.infer<typeof cliRefreshRequestSchema>;
export type CliRefreshResponse = z.infer<typeof cliRefreshResponseSchema>;
export type CliRevokeRequest = z.infer<typeof cliRevokeRequestSchema>;
export type CliRevokeResponse = z.infer<typeof cliRevokeResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
