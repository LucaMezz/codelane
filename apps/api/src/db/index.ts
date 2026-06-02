import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "#api/config/env";
import * as schema from "#api/db/schema/index";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
