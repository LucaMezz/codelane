import { z } from "zod";

import { locationValidator, timezoneValidator } from "./location-timezone.validators";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name must not be empty.")
    .max(100, "Name must be at most 100 characters.")
    .optional(),
  title: z.string().trim().max(300, "Title must be at most 300 characters.").optional(),
  location: locationValidator,
  timezone: timezoneValidator,
  status: z.string().trim().max(100, "Status must be at most 100 characters.").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters.")
      .max(128, "New password must be at most 128 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  emailVerified: Date | string | null;
  title: string | null;
  location: string | null;
  timezone: string | null;
  status: string | null;
};

export type PublicUserProfile = {
  id: string;
  name: string | null;
  image: string | null;
  title: string | null;
  location: string | null;
  timezone: string | null;
  status: string | null;
};
