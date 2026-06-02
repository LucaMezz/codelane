import morgan from "morgan";

import { env } from "#api/config/env";

export const morganConfig = morgan(env.NODE_ENV === "production" ? "combined" : "dev");
