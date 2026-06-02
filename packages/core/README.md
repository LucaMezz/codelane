# @codelane/core

`@codelane/core` is the dependency-free shared core package for the CodeLane monorepo.

It contains framework-agnostic code that can be safely shared by the backend API, the web app, the desktop app, and other internal packages without pulling in runtime-specific dependencies.

The package is intended to be the stable shared domain layer of the project.

## Overview

`@codelane/core` is for shared logic that is not tied to any specific runtime or framework.

It is used by:

- `apps/api`
- `apps/web`
- `apps/desktop`
- `packages/api-client`
- potentially other shared packages

Right now, this package includes shared Zod schemas that are used across the backend API and frontend applications. This allows validation logic and data contracts to stay consistent across the full stack.

## Role in the monorepo

`@codelane/core` sits at the lowest shared layer of the workspace.

```text
apps/
  api/          Backend API application
  web/          Browser frontend application
  desktop/      Desktop frontend application

packages/
  core/         Shared dependency-free domain logic and schemas
  api-client/   Shared API communication helpers
  ui/           Shared React UI components
```

The core package should be safe to import from almost anywhere in the repo.

Because of that, it must stay small, focused, and free of runtime-specific dependencies.

## Design purpose

The purpose of `@codelane/core` is to centralize code that would otherwise be duplicated across apps.

Good examples include:

- Zod schemas.
- Shared validation rules.
- Shared domain types.
- Shared constants.
- Pure utility functions.
- Serialization/deserialization helpers.
- Data transformation helpers.
- Common error/result types.
- Runtime-agnostic business rules.

The package should not depend on React, Express, Electron, browser APIs, database clients, API clients, or app-specific modules.

## Package structure

```text
packages/core/
├── src/
│   ├── schemas/       # Shared validation schemas
│   ├── types/         # Shared domain types, if needed
│   ├── utils/         # Pure dependency-free helpers, if needed
│   └── index.ts       # Public package entry point
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── knip.json
└── README.md
```

The exact structure may evolve, but the package should remain focused on dependency-free shared logic.

## What belongs in this package

Good candidates for `@codelane/core`:

- Zod schemas used by both the API and frontend apps.
- Shared request/response schemas.
- Shared form validation schemas.
- Shared domain entity schemas.
- Shared TypeScript types inferred from schemas.
- Pure functions that do not depend on a runtime.
- Constants used across backend and frontend code.
- Small helpers that encode domain behavior.

Example:

```ts
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SignInInput = z.infer<typeof signInSchema>;
```

This kind of code is useful in:

- the API, to validate incoming requests;
- the web app, to validate forms;
- the desktop app, to validate forms;
- the API client, to type request payloads.

## What does not belong in this package

Avoid placing the following in `@codelane/core`:

- React components.
- React hooks.
- Next.js route logic.
- Electron main/preload/renderer code.
- Express route handlers.
- Express middleware.
- Database clients.
- Database queries.
- API client fetch wrappers.
- Browser-only utilities.
- Node-only utilities.
- UI styling helpers.
- Tailwind/shadcn-specific utilities.
- App-specific feature workflows.

Use the following rule of thumb:

```text
Pure and reusable everywhere?
  Put it in @codelane/core.

Reusable React UI?
  Put it in @codelane/ui.

Reusable API communication?
  Put it in @codelane/api-client.

Backend runtime code?
  Put it in apps/api.

Web-only code?
  Put it in apps/web.

Desktop-only code?
  Put it in apps/desktop.
```

## Dependency policy

`@codelane/core` should have little to no runtime dependencies.

The ideal dependency shape is:

```text
dependencies:
  zod, if schemas are part of the core domain contract

no React
no Express
no Electron
no database clients
no API clients
no app packages
```

If a new dependency is added to `@codelane/core`, it should be carefully justified because every consumer of the core package may inherit that dependency.

## Zod schemas

Shared Zod schemas are one of the main reasons this package exists.

Zod schemas let the repo share validation logic between backend and frontend code.

Example usage in the API:

```ts
import { signInSchema } from "@codelane/core";

const result = signInSchema.safeParse(req.body);
```

Example usage in a frontend app:

```ts
import { signInSchema } from "@codelane/core";

const result = signInSchema.safeParse(formValues);
```

This avoids duplicating validation rules and keeps the client and server aligned.

## Type inference from schemas

When using Zod, prefer deriving TypeScript types from schemas instead of manually duplicating types.

Good:

```ts
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof userSchema>;
```

Avoid:

```ts
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

export type User = {
  id: string;
  email: string;
};
```

Duplicating types makes it easier for schemas and types to drift apart.

## Public API

The public API of this package should be exported from:

```text
src/index.ts
```

Consumers should import from the package entry point:

```ts
import { signInSchema } from "@codelane/core";
```

Avoid deep imports into package internals:

```ts
// Avoid
import { signInSchema } from "@codelane/core/src/schemas/auth";
```

If something should be used outside this package, export it from `src/index.ts`.

## Internal import conventions

This package uses `package.json#imports` for package-local imports.

Use `#/*` for internal package imports:

```ts
import { userSchema } from "#/schemas/user";
import { normalizeEmail } from "#/utils/normalize-email";
```

This avoids collisions with app-local aliases and makes package ownership clear.

Recommended rules:

- Use `#/*` only inside this package.
- Use `@codelane/core` when importing from other apps or packages.
- Do not use app-local aliases such as `@/*` inside `@codelane/core`.

## Dependency boundaries

`@codelane/core` follows the strictest package boundaries in the monorepo.

It must not import from:

- `apps/api`
- `apps/web`
- `apps/desktop`
- `packages/ui`
- `packages/api-client`

It should also avoid importing runtime-specific libraries such as:

- React
- React DOM
- Next.js
- Electron
- Express
- database clients
- browser-only APIs
- Node-only APIs

Architecture boundaries are enforced from the repo root:

```bash
pnpm deps:arch
```

## Relationship to `apps/api`

The API can use `@codelane/core` for shared schemas, types, and validation rules.

Good API usage:

```ts
import { createUserSchema } from "@codelane/core";
```

The API should keep runtime-specific behavior, database access, middleware, and route handlers inside `apps/api`.

If a backend type or schema also needs to be used by web or desktop, it is a good candidate for `@codelane/core`.

## Relationship to `apps/web`

The web app can use `@codelane/core` for shared validation and domain types.

Good web usage:

```ts
import { signInSchema } from "@codelane/core";
```

The web app should keep Next.js routes, layouts, and browser-specific behavior inside `apps/web`.

## Relationship to `apps/desktop`

The desktop app can use `@codelane/core` for shared validation and domain types.

Good desktop usage:

```ts
import { signInSchema } from "@codelane/core";
```

The desktop app should keep Electron main-process, preload, IPC, and renderer-specific behavior inside `apps/desktop`.

## Relationship to `@codelane/ui`

`@codelane/ui` may use `@codelane/core` if it needs shared framework-agnostic logic.

However, `@codelane/core` must not import from `@codelane/ui`.

The dependency direction should be:

```text
@codelane/ui -> @codelane/core
```

not:

```text
@codelane/core -> @codelane/ui
```

## Relationship to `@codelane/api-client`

`@codelane/api-client` may use `@codelane/core` for shared request/response schemas and types.

However, `@codelane/core` must not import from `@codelane/api-client`.

The dependency direction should be:

```text
@codelane/api-client -> @codelane/core
```

not:

```text
@codelane/core -> @codelane/api-client
```

## Scripts

Run commands from the repository root using pnpm filters.

### Build the core package

```bash
pnpm --filter @codelane/core build
```

### Typecheck the core package

```bash
pnpm --filter @codelane/core typecheck
```

### Run Knip for the core package

```bash
pnpm --filter @codelane/core knip
```

### Run tests

```bash
pnpm --filter @codelane/core test:run
```

if tests are configured for this package.

## Development workflow

A typical workflow for changing shared schemas or core logic:

```bash
pnpm install
pnpm --filter @codelane/core typecheck
pnpm --filter @codelane/core build
```

Then run the root checks to make sure all consumers still work:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm check
pnpm knip
pnpm test:run
pnpm build
```

Because this package is used across apps, changes here can affect the entire monorepo.

## Adding a new schema

When adding a new schema:

1. Place it in a logical schema module.
2. Export the schema.
3. Derive types from the schema using `z.infer`.
4. Export the schema and inferred type from `src/index.ts`.
5. Use it from the API and frontend apps through `@codelane/core`.
6. Run typecheck and build.

Example:

```ts
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
```

Then export it:

```ts
export * from "#/schemas/project";
```

Then consume it:

```ts
import { createProjectSchema } from "@codelane/core";
```

## Schema design guidelines

Recommended practices:

- Keep schemas focused and composable.
- Use clear names that describe the domain concept.
- Infer TypeScript types from schemas.
- Avoid mixing API transport concerns with unrelated app behavior.
- Keep validation errors useful and predictable.
- Prefer shared schemas for data crossing app/backend boundaries.
- Avoid adding frontend-only form behavior to core schemas unless it is genuinely shared.

## Utility design guidelines

Core utilities should be pure and dependency-free.

Good utilities:

- string normalization helpers
- date-independent formatting helpers
- domain-specific pure functions
- result/error helpers
- schema transformation helpers

Avoid utilities that require:

- DOM APIs
- browser storage
- Node file system APIs
- Electron APIs
- Express request/response objects
- React state/hooks

## Testing strategy

Core package tests should focus on correctness of shared logic.

Good test targets:

- Zod schemas.
- Validation edge cases.
- Pure utility functions.
- Data transformation helpers.
- Domain rules.

Core tests should be fast, deterministic, and free of external services.

Because this package has no runtime dependencies, it should be one of the easiest packages to test thoroughly.

## Versioning and publishing

`@codelane/core` is an internal package for this monorepo.

It is not intended to be published as an external npm package. It exists to share code between the apps and packages in this repository.

Internal consumers should depend on it with:

```json
"@codelane/core": "workspace:*"
```

## Common issues

### A frontend and backend type drift apart

Move the shared schema/type into `@codelane/core` and import it from both places.

### A schema needs database-specific behavior

Keep database behavior in `apps/api`.

If only the shape or validation rule is shared, put that part in `@codelane/core`.

### A utility needs React

It does not belong in `@codelane/core`.

Move it to `@codelane/ui` or the app that needs it.

### A utility needs Express or Node APIs

It probably belongs in `apps/api`, not `@codelane/core`.

### A utility needs Electron APIs

It belongs in `apps/desktop`, not `@codelane/core`.

### Import from `#/*` fails

Check that:

- `package.json` has the correct `imports` field.
- `tsconfig.json` has matching `paths`.
- The import points to an actual file.
- The file is included in the package's TypeScript configuration.

## Quality checks

This package participates in the root quality workflow:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm knip
pnpm check
pnpm test:run
pnpm build
```

The package should remain compatible with:

- syncpack dependency consistency.
- dependency-cruiser architecture rules.
- Knip unused dependency/export detection.
- Oxlint/oxfmt linting and formatting.
- TypeScript/tsgo typechecking.
- Turborepo task orchestration.
- API, web, desktop, UI, and API client consumers.

## Design goals

`@codelane/core` is designed to be:

- **Dependency-free**: avoids runtime-specific dependencies.
- **Framework-agnostic**: usable by backend, web, desktop, and packages.
- **Stable**: acts as a shared domain contract layer.
- **Typed**: exports TypeScript types derived from runtime schemas where possible.
- **Reusable**: prevents duplication across apps.
- **Small and focused**: contains only code that truly belongs at the core layer.
- **Safe to import broadly**: avoids dependency cycles and runtime coupling.

## Non-goals

This package is not intended to contain:

- UI components.
- React hooks.
- API route handlers.
- API client fetch wrappers.
- Database access.
- Electron runtime logic.
- Next.js route logic.
- Express middleware.
- App-specific workflows.
- Published package infrastructure.

If code depends on a specific runtime, it probably does not belong in `@codelane/core`.

## Related documentation

See the root README for:

- Full monorepo overview.
- Workspace structure.
- App/package boundaries.
- Repository-wide tooling.
- Dependency management.
- Commit conventions.
- Architecture rules.

## License

This package is part of the CodeLane monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
