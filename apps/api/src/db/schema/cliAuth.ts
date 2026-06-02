import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const cliAuthorizationCodes = pgTable("cli_authorization_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  codeHash: text("code_hash").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  codeChallenge: text("code_challenge").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  state: text("state").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  consumedAt: timestamp("consumed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const cliSessions = pgTable("cli_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  refreshTokenHash: text("refresh_token_hash").notNull().unique(),
  name: text("name").notNull(),
  userAgent: text("user_agent"),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const cliAuthorizationCodesRelations = relations(cliAuthorizationCodes, ({ one }) => ({
  user: one(users, {
    fields: [cliAuthorizationCodes.userId],
    references: [users.id],
  }),
}));

export const cliSessionsRelations = relations(cliSessions, ({ one }) => ({
  user: one(users, {
    fields: [cliSessions.userId],
    references: [users.id],
  }),
}));
