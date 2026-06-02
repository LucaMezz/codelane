# AppKit API

The AppKit API is the shared backend application for the AppKit monorepo.

It provides the server-side foundation for the web and desktop applications, including API routes, middleware, authentication-related backend configuration, database access, and application-level backend wiring.

This app is designed to be the single backend service that can support multiple frontend clients while sharing types, validation, and client logic through the monorepo's internal packages.

## Overview

`apps/api` is responsible for backend runtime behavior.

It owns:

- Express application setup.
- API route registration.
- Backend middleware.
- Authentication/session backend integration.
- Database configuration and schema access.
- Server startup and environment configuration.
- Backend-only utilities and services.

It should not depend on frontend-only packages such as `@appkit/ui`.

## Role in the monorepo

The API is one of the deployable applications in the AppKit starter kit.

```text
apps/
  api/          Shared backend API application
  web/          Browser frontend
  desktop/      Desktop frontend

packages/
  core/         Shared framework-agnostic logic
  api-client/   Shared client for calling the API
  ui/           Shared React UI components
```

The API should expose backend functionality to frontend clients through stable HTTP/API contracts. Frontend apps should communicate with the backend through the API client package where possible, rather than importing API implementation details directly.

## Architecture

The API follows a modular backend structure:

```text
apps/api/
├── src/
│   ├── app.ts                 # Express app composition
│   ├── server.ts              # Server startup entry point
│   ├── config/                # Environment and backend configuration
│   ├── db/                    # Database client and schema access
│   ├── lib/                   # Backend library/config helpers
│   ├── middleware/            # Express middleware
│   ├── modules/               # Feature modules and routes
│   └── utils/                 # Backend utility functions
│
├── Dockerfile
├── package.json
└── README.md
```

## Key files and folders

### `src/server.ts`

The runtime entry point for starting the API server.

This file should stay small and should mostly be responsible for:

- Loading configuration.
- Starting the HTTP server.
- Logging the startup status.
- Delegating application behavior to `app.ts`.

### `src/app.ts`

Composes the Express application.

This is where global middleware and route modules are registered.

Typical responsibilities include:

- Security middleware.
- CORS middleware.
- Request logging.
- Body parsing.
- Auth routes or auth integration.
- Feature route registration.
- Not-found handling.
- Error handling.

### `src/config/`

Environment and configuration code.

This folder should centralize environment variable parsing and validation so the rest of the backend can depend on a typed config object instead of reading `process.env` directly throughout the codebase.

### `src/db/`

Database access and schema definitions.

This folder should contain:

- Database connection setup.
- Schema exports.
- Database-related helpers.

Database schema modules should remain backend-owned. Frontend apps should not import directly from `apps/api/src/db`.

If types need to be shared with frontend code, move framework-agnostic types or validation schemas into `packages/core`.

### `src/lib/`

Backend-specific integration helpers.

Examples include:

- Auth configuration.
- CORS configuration.
- Request logging configuration.
- Other server-side library setup.

Code in `src/lib` can integrate external backend libraries, but should avoid becoming a dumping ground for unrelated business logic.

### `src/middleware/`

Express middleware.

This is the right place for reusable request/response middleware such as:

- Error handling.
- Not-found handling.
- Auth guards.
- Request context setup.
- Request validation middleware.

Middleware should generally be small and composable.

### `src/modules/`

Feature modules.

A module groups related backend behavior together.

Example structure:

```text
modules/
  users/
    users.routes.ts
    users.controller.ts
    users.service.ts
```

Recommended responsibilities:

- `*.routes.ts`: Express route definitions and route-level middleware.
- `*.controller.ts`: Request/response handling and input extraction.
- `*.service.ts`: Business logic and database interaction orchestration.

### `src/utils/`

Backend utility functions.

Use this folder for backend-specific pure helpers that do not deserve their own feature module.

If a utility becomes useful outside the API app, move it to `packages/core`.

## Dependency boundaries

The API follows these monorepo boundaries:

- The API may import from `@appkit/core` for shared framework-agnostic logic.
- The API may expose behavior that is consumed by `@appkit/api-client`.
- The API must not import from `apps/web`.
- The API must not import from `apps/desktop`.
- The API must not import from `@appkit/ui`.
- Shared packages must not import from the API app.
- Frontend apps must not import API implementation files directly.

These boundaries are enforced at the repository level with dependency-cruiser:

```bash
pnpm deps:arch
```

## Import conventions

The API uses package-level import conventions to keep imports predictable.

### API-local imports

API-local source imports should use the API package's local import convention.

For example:

```ts
import { env } from "#/config/env";
import { db } from "#/db";
import { usersRoutes } from "#/modules/users/users.routes";
```

### Cross-package imports

Use workspace package names when importing shared packages:

```ts
import { someCoreHelper } from "@appkit/core";
```

### Avoid app-to-app imports

Do not import from other apps:

```ts
// Avoid
import { something } from "../../web/...";
import { somethingElse } from "../../desktop/...";
```

If code is needed by multiple apps, move it into a shared package.

## Scripts

Run commands from the repository root using pnpm filters.

### Start the API in development

```bash
pnpm --filter @appkit/api dev
```

### Typecheck the API

```bash
pnpm --filter @appkit/api typecheck
```

### Build the API

```bash
pnpm --filter @appkit/api build
```

### Run API tests

```bash
pnpm --filter @appkit/api test:run
```

### Run Knip for the API

```bash
pnpm --filter @appkit/api knip
```

## Development workflow

A typical local API workflow is:

```bash
pnpm install
pnpm --filter @appkit/api dev
```

Before committing API changes, run:

```bash
pnpm check
pnpm knip
pnpm deps:arch
pnpm test:run
```

For API-specific validation:

```bash
pnpm --filter @appkit/api typecheck
pnpm --filter @appkit/api build
```

## Environment configuration

Environment variables should be defined and validated in `src/config`.

The preferred pattern is:

1. Read environment variables in one place.
2. Validate them at startup.
3. Export a typed config object.
4. Import the config object elsewhere.

Avoid scattering direct `process.env` access throughout the backend.

Good:

```ts
import { env } from "#/config/env";
```

Avoid:

```ts
const port = process.env.PORT;
```

## Database

The API owns database access.

Database-related code should stay in `src/db` and backend service modules.

Recommended guidelines:

- Keep schema definitions centralized.
- Keep connection setup isolated.
- Avoid importing database internals into frontend apps.
- Move shared validation/types into `packages/core` if they are needed outside the backend.
- Keep database calls out of controllers where possible; prefer service modules.

## Authentication and sessions

Authentication-related backend code should be treated as security-sensitive.

Recommended guidelines:

- Keep auth configuration centralized.
- Keep password hashing and credential handling isolated.
- Avoid leaking auth implementation details to frontend apps.
- Validate credentials and session-related inputs carefully.
- Prefer explicit middleware for protected routes.
- Keep security-related utilities small and well-documented.

## Middleware guidelines

Middleware should be composable and focused.

Good middleware examples:

- `requireAuthMiddleware`
- `notFoundMiddleware`
- `errorMiddleware`

Recommended rules:

- Middleware should not contain large business workflows.
- Middleware should call `next(error)` for error propagation where appropriate.
- Error-handling middleware should be registered after routes.
- Not-found middleware should be registered after route registration.

## Module guidelines

Feature modules should keep related backend code together.

A typical feature module can include:

```text
modules/example/
  example.routes.ts
  example.controller.ts
  example.service.ts
```

Recommended separation:

```text
routes      HTTP route definitions
controller  request/response adapter layer
service     business logic and data access orchestration
```

This keeps route files readable and makes business logic easier to test.

## Error handling

Errors should flow through the centralized error middleware.

Recommended practices:

- Throw typed/custom errors where useful.
- Convert unexpected errors into safe API responses.
- Avoid leaking stack traces or sensitive details in production.
- Keep user-facing error messages clear but safe.
- Log enough detail for debugging server-side issues.

## CORS and origins

CORS configuration should be centralized and environment-aware.

Recommended practices:

- Keep allowed origins in config.
- Avoid broad wildcard origins for authenticated routes.
- Treat desktop and web clients deliberately.
- Document any special local-development origins.

## Docker

The API includes Docker support for containerized development or deployment workflows.

Typical usage may include:

```bash
docker compose up api
```

or root scripts such as:

```bash
pnpm api:docker
```

depending on the current root `package.json` scripts.

Docker should be used for environment parity and service orchestration, especially when paired with database services.

## Testing strategy

API tests should focus on:

- Pure service logic.
- Route behavior.
- Middleware behavior.
- Auth/session edge cases.
- Database-independent business rules.
- Integration tests where useful.

As the backend grows, prefer a layered strategy:

```text
unit tests        small utilities and services
integration tests routes, middleware, database interactions
contract tests    API behavior expected by frontend clients
```

## Relationship to `@appkit/api-client`

The API implementation lives in `apps/api`.

Reusable client-side API communication helpers should live in `packages/api-client`.

The API should define behavior. The API client should consume that behavior from frontend apps.

Avoid duplicating endpoint strings, request shapes, or response handling across frontend apps when they can be centralized in `@appkit/api-client`.

## Relationship to `@appkit/core`

Shared domain types, validation helpers, and framework-agnostic utilities can live in `@appkit/core`.

Use `@appkit/core` when code:

- Has no dependency on Express.
- Has no dependency on Node-only APIs.
- Has no dependency on React.
- Can be reused by more than one app/package.

Keep API-specific runtime code in `apps/api`.

## Security guidelines

The API should be treated as the trust boundary for the application.

Recommended practices:

- Validate all external input.
- Centralize environment validation.
- Avoid exposing internal errors.
- Use secure password hashing.
- Keep auth/session handling isolated.
- Avoid logging secrets.
- Keep CORS rules deliberate.
- Do not trust frontend-provided identity or authorization data.
- Prefer explicit route guards for protected resources.

## Common issues

### Environment variables are missing

Check the API environment configuration and make sure required variables are defined before starting the server.

### API imports fail after alias changes

Check that API-local imports use the package's configured import convention, such as:

```ts
import { env } from "#/config/env";
```

Also make sure the API package's `package.json` and `tsconfig.json` agree on package import aliases.

### Frontend needs a backend type

Do not import backend implementation files directly.

Move shared types or validation schemas into `packages/core`, then import from `@appkit/core`.

### Knip reports root-provided binaries

Some tooling binaries may be intentionally provided from the workspace root. If Knip reports one as unlisted, document and ignore it in the package-level Knip config rather than duplicating tooling dependencies unnecessarily.

### API code needs UI behavior

The API should not import from `@appkit/ui`.

Move shared non-UI logic into `@appkit/core`, or keep frontend-specific behavior in the frontend apps.

## Quality checks

The API participates in the root quality workflow:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm knip
pnpm check
pnpm test:run
pnpm build
```

The API should remain compatible with:

- syncpack dependency consistency.
- dependency-cruiser architecture rules.
- Knip unused dependency/export detection.
- Oxlint/oxfmt linting and formatting.
- TypeScript/tsgo typechecking.
- Turborepo task orchestration.

## Design goals

The API is designed to be:

- **Shared**: usable by both web and desktop clients.
- **Modular**: organized by features, middleware, database, and configuration.
- **Typed**: using TypeScript throughout.
- **Secure**: treating auth, environment variables, and input validation carefully.
- **Monorepo-aware**: integrated with shared packages and root tooling.
- **Maintainable**: clear boundaries between routes, controllers, services, config, and database logic.

## Non-goals

The API should not contain frontend UI code, desktop runtime code, or shared package implementation details.

If logic is reusable across apps, move it into a package. If logic is backend-specific, keep it in the API app.

## Related documentation

See the root README for:

- Full monorepo overview.
- Workspace structure.
- Shared package descriptions.
- Repository-wide tooling.
- Dependency management.
- Commit conventions.
- Architecture rules.

## License

This app is part of the AppKit monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
