import {
  ChangePasswordInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
  registerSchema,
} from "@codelane/core";
import { eq } from "drizzle-orm";

import { db } from "#api/db/index";
import { userPreferences, users } from "#api/db/schema/index";
import { hashPassword, verifyPassword } from "#api/utils/password";

export const usersService = {
  async register(input: unknown) {
    const result = registerSchema.safeParse(input);

    if (!result.success) {
      throw new Error("Invalid registration input");
    }

    const { name, email, password } = result.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
      });

    return user;
  },

  list() {
    return db.select().from(users);
  },

  findByEmail(email: string) {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  },

  async getMe(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        bio: true,
        location: true,
        website: true,
        timezone: true,
        status: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateMe(userId: string, input: UpdateProfileInput) {
    const [updated] = await db
      .update(users)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.bio !== undefined && { bio: input.bio || null }),
        ...(input.location !== undefined && { location: input.location || null }),
        ...(input.website !== undefined && { website: input.website || null }),
        ...(input.timezone !== undefined && { timezone: input.timezone || null }),
        ...(input.status !== undefined && { status: input.status || null }),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        bio: users.bio,
        location: users.location,
        website: users.website,
        timezone: users.timezone,
        status: users.status,
      });

    if (!updated) {
      throw new Error("User not found");
    }

    return updated;
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      throw new Error("No password set for this account");
    }

    const valid = await verifyPassword(user.passwordHash, input.currentPassword);
    if (!valid) {
      throw new Error("Current password is incorrect");
    }

    const newHash = await hashPassword(input.newPassword);

    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));
  },

  async getPreferences(userId: string) {
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (existing) {
      return existing;
    }

    const [created] = await db.insert(userPreferences).values({ userId }).returning();

    return created!;
  },

  async updatePreferences(userId: string, input: UpdatePreferencesInput) {
    await usersService.getPreferences(userId);

    const [updated] = await db
      .update(userPreferences)
      .set({
        ...(input.theme !== undefined && { theme: input.theme }),
        ...(input.emailNotifications !== undefined && {
          emailNotifications: input.emailNotifications,
        }),
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId))
      .returning();

    return updated!;
  },
};
