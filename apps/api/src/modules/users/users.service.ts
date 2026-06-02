import { registerSchema } from "@appkit/core";
import { eq } from "drizzle-orm";

import { db } from "#api/db/index";
import { users } from "#api/db/schema/index";
import { hashPassword } from "#api/utils/password";

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
};
