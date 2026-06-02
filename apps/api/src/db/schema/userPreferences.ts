import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: themeEnum("theme").default("system").notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
