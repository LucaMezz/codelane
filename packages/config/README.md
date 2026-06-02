# @codelane/config

`@codelane/config` provides shared configuration defaults, environment parsing, environment variable names, and URL helpers for the CodeLane monorepo.

The package exists to keep ports, local origins, env names, and URL handling centralized instead of scattering hardcoded local URLs across apps and packages.

## Overview

This package owns:

- default local ports
- default local hosts and origins
- CORS origin defaults
- server environment parsing
- client-safe exports
- URL helpers such as `joinUrl`
- shared environment variable names

It should stay small, runtime-aware, and free of app implementation details.

## Exports

```ts
import { joinUrl } from "@codelane/config";
import { joinUrl } from "@codelane/config/client";
import { parseServerEnv } from "@codelane/config/server";
```

Use `@codelane/config/client` from browser-safe code.

Use `@codelane/config/server` only in server-side Node code.

## Package structure

```text
packages/config/
├── src/
│   ├── client.ts      # Browser-safe exports
│   ├── defaults.ts    # Shared default ports, hosts, origins
│   ├── env-names.ts   # Shared env var name constants
│   ├── index.ts       # Public default entry
│   ├── server.ts      # Server env parsing
│   └── urls.ts        # URL helpers
├── package.json
├── tsconfig.json
└── README.md
```

## Defaults

Default ports:

```text
api: 4000
web: 3000
desktopRenderer: 5173
postgres: 5432
```

Default local origins:

```text
http://localhost:4000
http://localhost:3000
http://localhost:5173
```

Use these helpers instead of hardcoding local URLs in source files.

## Environment variables

Server env parsing expects:

```text
DATABASE_URL
AUTH_SECRET
```

Optional values include:

```text
NODE_ENV
API_PORT
PORT
CORS_ORIGINS
CORS_ORIGIN
```

See the root `.env.example` for local development values.

## What belongs here

Good candidates:

- shared port defaults
- local origin defaults
- URL construction helpers
- env var name constants
- server-side env parsing schemas
- browser-safe config helpers

## What does not belong here

Avoid:

- app-specific feature config
- secrets
- React code
- API route logic
- database access
- CLI command behavior
- Electron runtime behavior

## Boundary rules

- Browser code must not import `@codelane/config/server`.
- Server-only parsing should stay in `server.ts`.
- Client-safe helpers should be exported from `client.ts`.
- Apps and packages should use config helpers instead of hardcoded local URLs.

## Scripts

```bash
pnpm --filter @codelane/config build
pnpm --filter @codelane/config typecheck
pnpm --filter @codelane/config knip
```

## Development guidelines

- Keep defaults centralized.
- Keep env parsing strict and typed.
- Do not put real secret values in this package.
- Update `.env.example` when required env vars change.
- Run `pnpm lint:no-hardcoded-local-urls` after config changes.

## License

This package is part of the CodeLane monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
