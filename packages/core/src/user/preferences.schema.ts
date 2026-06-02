import { z } from "zod";

export const themeSchema = z.enum(["light", "dark", "system"]);
export type Theme = z.infer<typeof themeSchema>;

export const updatePreferencesSchema = z.object({
  theme: themeSchema.optional(),
  emailNotifications: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export type UserPreferences = {
  userId: string;
  theme: Theme;
  emailNotifications: boolean;
};
