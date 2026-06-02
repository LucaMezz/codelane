# @appkit/api-client

`@appkit/api-client` is the shared API communication package for the AppKit monorepo.

It provides reusable client-side helpers for calling the AppKit backend API from multiple frontend targets, such as the web app and desktop renderer. Its purpose is to prevent duplicated request logic, endpoint strings, response handling, and API-related types across apps.

## Overview

This package is responsible for shared API client code.

It is used by:

- `apps/web`
- `apps/desktop`
- potentially other frontend/client packages

It may use shared schemas and types from `@appkit/core`, but it should not import implementation details from `apps/api`.

The API client should represent the public client-facing contract of the backend, not the backend's internal implementation.

## Role in the monorepo

`@appkit/api-client` sits between frontend apps and the backend API.

```text
apps/
  api/          Backend API implementation
  web/          Browser frontend that consumes @appkit/api-client
  desktop/      Desktop renderer that consumes @appkit/api-client

packages/
  api-client/   Shared API communication helpers
  core/         Shared schemas, types, and framework-agnostic logic
  ui/           Shared React UI components
```

The intended dependency direction is:

```text
apps/web      -> @appkit/api-client -> @appkit/core
apps/desktop  -> @appkit/api-client -> @appkit/core
apps/api      -> @appkit/core
```

The API client should not depend on the web app, desktop app, or API app.

## Package structure

```text
packages/api-client/
├── src/
│   ├── index.ts        # Public package entry point
│   ├── client/         # Client setup, request helpers, fetch wrappers
│   ├── endpoints/      # Endpoint-specific API helpers
│   ├── errors/         # API error helpers, if needed
│   ├── types/          # Client-specific types, if needed
│   └── utils/          # Client utility functions, if needed
│
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── knip.json
└── README.md
```

The exact structure may evolve, but the package should remain focused on API communication and client-facing API contracts.

## What belongs in this package

Good candidates for `@appkit/api-client`:

- Shared fetch wrappers.
- API client factory functions.
- Endpoint-specific request helpers.
- Request/response typing helpers.
- API error normalization.
- Shared client configuration types.
- Client-side API utilities.
- Code that is reused by both web and desktop clients.

Examples:

```ts
import { createApiClient } from "@appkit/api-client";

const api = createApiClient({
  baseUrl: "http://localhost:3001",
});

const user = await api.users.me();
```

## What does not belong in this package

Avoid placing the following here:

- Express route handlers.
- Express middleware.
- Database queries.
- Backend service implementations.
- Authentication provider configuration.
- React components.
- React hooks tied to a specific UI framework.
- Next.js route handlers or server actions.
- Electron main/preload code.
- Desktop IPC handlers.
- Web-only or desktop-only feature workflows.

Use the following rule of thumb:

```text
Reusable API communication?
  Put it in @appkit/api-client.

Shared schemas or pure types?
  Put it in @appkit/core.

Backend implementation?
  Put it in apps/api.

Reusable React UI?
  Put it in @appkit/ui.

Specific to one app?
  Keep it in that app.
```

## Public API

The public API of this package should be exported from:

```text
src/index.ts
```

Consumers should import from the package entry point:

```ts
import { createApiClient } from "@appkit/api-client";
```

Avoid deep imports into package internals:

```ts
// Avoid
import { createApiClient } from "@appkit/api-client/src/client/create-api-client";
```

If a helper should be used outside this package, export it from `src/index.ts`.

## Internal import conventions

This package uses `package.json#imports` for package-local imports.

Use `#/*` for internal package imports:

```ts
import { createRequest } from "#/client/create-request";
import { normalizeApiError } from "#/errors/normalize-api-error";
```

This avoids collisions with app-local aliases and makes package ownership clear.

Recommended rules:

- Use `#/*` only inside this package.
- Use `@appkit/api-client` when importing from apps or other packages.
- Do not use app-local aliases such as `@/*` inside shared packages.

## Relationship to `apps/api`

The API implementation lives in `apps/api`.

The API client should not import from `apps/api/src`.

Instead, shared request/response schemas or types should live in `@appkit/core` if they are needed by both the API and the API client.

Good:

```ts
import { signInSchema } from "@appkit/core";
```

Avoid:

```ts
// Avoid
import { usersService } from "../../apps/api/src/modules/users/users.service";
```

The API client consumes the backend through network/API boundaries, not by importing server implementation code.

## Relationship to `@appkit/core`

`@appkit/api-client` may use `@appkit/core` for shared schemas, domain types, and validation.

Example:

```ts
import { signInSchema, type SignInInput } from "@appkit/core";
```

This is useful when the same data contract is needed by:

- the backend API for request validation;
- the API client for typed request payloads;
- frontend apps for form validation or response handling.

The dependency direction should be:

```text
@appkit/api-client -> @appkit/core
```

not:

```text
@appkit/core -> @appkit/api-client
```

## Relationship to frontend apps

Frontend apps should use this package when they need to call the backend API.

Good:

```ts
import { createApiClient } from "@appkit/api-client";
```

Avoid duplicating request logic directly in each app unless the behavior is genuinely app-specific.

The goal is to prevent this kind of duplication:

```text
apps/web      defines /auth/sign-in fetch logic
apps/desktop  separately defines /auth/sign-in fetch logic
```

Instead, shared API communication should live here.

## Relationship to `@appkit/ui`

This package should generally not depend on `@appkit/ui`.

API communication should be UI-framework-agnostic. UI-specific behavior, components, loading states, and error display should live in the consuming app or `@appkit/ui`.

The normal direction is:

```text
apps/web or apps/desktop -> @appkit/ui
apps/web or apps/desktop -> @appkit/api-client
```

not:

```text
@appkit/api-client -> @appkit/ui
```

## Dependency boundaries

`@appkit/api-client` follows these rules:

- It may import from `@appkit/core`.
- It must not import from `apps/api`.
- It must not import from `apps/web`.
- It must not import from `apps/desktop`.
- It should not import from `@appkit/ui`.
- It should avoid runtime-specific assumptions where possible.
- It should not import generated build output.

Architecture boundaries are enforced from the repo root:

```bash
pnpm deps:arch
```

## Client design guidelines

The API client should be small, predictable, and reusable.

Recommended practices:

- Centralize base URL configuration.
- Centralize common request behavior.
- Normalize common API errors.
- Keep endpoint helpers focused.
- Avoid app-specific UI behavior.
- Avoid backend implementation imports.
- Use `@appkit/core` for shared schemas and types.
- Keep request and response types explicit.

## Error handling

API errors should be normalized in a way that frontend apps can handle consistently.

A useful API client error model may include:

- HTTP status code.
- Error code.
- User-safe message.
- Optional validation issues.
- Original error cause, where appropriate.

The API client should not decide how errors are displayed in UI. It should expose useful structured information so apps can decide how to present errors.

Example:

```ts
try {
  await api.auth.signIn(input);
} catch (error) {
  const apiError = normalizeApiError(error);
  // The app decides how to display the error.
}
```

## Request validation

If request schemas are shared through `@appkit/core`, the API client can optionally validate input before making requests.

Example:

```ts
import { signInSchema } from "@appkit/core";

export async function signIn(input: unknown) {
  const data = signInSchema.parse(input);

  return request("/auth/sign-in", {
    method: "POST",
    body: data,
  });
}
```

Whether validation happens in the API client, the app, or both depends on the use case. The backend should still validate requests regardless of client-side validation.

## Response validation

For critical data contracts, response validation can help catch backend/client drift.

If response schemas live in `@appkit/core`, the API client can validate responses before returning them.

This can be especially useful for:

- auth/session responses;
- user/profile data;
- generated API clients;
- data that is shared by web and desktop apps.

Be careful not to overuse runtime validation on every request if it adds unnecessary complexity or performance cost.

## Configuration

The API client should be configurable enough to work in different frontend runtimes.

Potential configuration options include:

```ts
type ApiClientConfig = {
  baseUrl: string;
  fetch?: typeof fetch;
  getAccessToken?: () => string | Promise<string | null>;
};
```

This allows the same client to be used by:

- browser code;
- desktop renderer code;
- tests;
- future server-side or script usage.

## Fetch abstraction

Prefer a small internal request helper over repeating `fetch` options everywhere.

A request helper can centralize:

- base URL joining;
- JSON serialization;
- JSON parsing;
- auth headers;
- common error handling;
- response validation;
- timeout or abort behavior, if needed later.

Example shape:

```ts
async function request<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
  // shared fetch behavior
}
```

## Scripts

Run commands from the repository root using pnpm filters.

### Build the API client package

```bash
pnpm --filter @appkit/api-client build
```

### Typecheck the API client package

```bash
pnpm --filter @appkit/api-client typecheck
```

### Run Knip for the API client package

```bash
pnpm --filter @appkit/api-client knip
```

### Run tests

```bash
pnpm --filter @appkit/api-client test:run
```

if tests are configured for this package.

## Development workflow

A typical workflow for changing the API client:

```bash
pnpm install
pnpm --filter @appkit/api-client typecheck
pnpm --filter @appkit/api-client build
```

Then verify consuming apps:

```bash
pnpm --filter @appkit/web typecheck
pnpm --filter @appkit/desktop typecheck
```

Before committing:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm check
pnpm knip
pnpm test:run
pnpm build
```

Because this package is shared by frontend targets, changes here can affect both web and desktop clients.

## Adding a new endpoint helper

When adding a new endpoint helper:

1. Identify whether request/response schemas should live in `@appkit/core`.
2. Add or reuse the relevant schemas/types.
3. Add the endpoint helper in a logical module.
4. Export it through the public client API.
5. Keep app-specific UI behavior out of the package.
6. Run typecheck/build and verify consumers.

Example structure:

```text
src/
  endpoints/
    users.ts
  client/
    create-api-client.ts
  index.ts
```

Example export:

```ts
export * from "#/client/create-api-client";
export * from "#/endpoints/users";
```

## Testing strategy

API client tests should focus on:

- request construction;
- base URL handling;
- JSON serialization;
- response parsing;
- error normalization;
- schema validation behavior;
- endpoint helper behavior.

Tests should avoid relying on a live backend when possible. Prefer mocked `fetch` or test-specific fetch implementations.

Potential test categories:

```text
unit tests         request helpers and error utilities
contract tests     shared request/response schema expectations
integration tests  optional tests against a running API
```

## Versioning and publishing

`@appkit/api-client` is an internal package for this monorepo.

It is not intended to be published as an external npm package. It exists to share API communication logic between apps in this repository.

Internal consumers should depend on it with:

```json
"@appkit/api-client": "workspace:*"
```

## Common issues

### Frontend app duplicates API request logic

Move the shared request logic into `@appkit/api-client` and consume it from both apps.

### API client needs backend types

If the type is a shared contract, move it into `@appkit/core`.

Do not import from `apps/api/src`.

### API client needs UI behavior

It probably does not belong in `@appkit/api-client`.

Keep UI behavior in the consuming app or `@appkit/ui`.

### API client needs auth tokens

Make token retrieval configurable instead of hardcoding app-specific storage behavior.

Good:

```ts
createApiClient({
  baseUrl,
  getAccessToken,
});
```

Avoid hardcoding local storage, cookies, or Electron storage directly in the shared client unless the behavior is truly cross-platform.

### Import from `#/*` fails

Check that:

- `package.json` has the correct `imports` field.
- `tsconfig.json` has matching `paths`.
- The import points to an actual file.
- The file is included in the package's TypeScript configuration.

### Response shape changed in the backend

If the response shape is shared, update the schema/type in `@appkit/core`, then update both the API implementation and API client.

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
- API, web, and desktop consumers.

## Design goals

`@appkit/api-client` is designed to be:

- **Reusable**: shared by web and desktop clients.
- **Typed**: uses shared types and schemas where appropriate.
- **Client-focused**: represents API communication, not backend implementation.
- **Runtime-flexible**: configurable enough for browser, desktop renderer, and tests.
- **Small and focused**: avoids UI, backend, and app-specific concerns.
- **Monorepo-aware**: follows AppKit package boundaries and import conventions.
- **Maintainable**: centralizes request behavior and reduces duplication.

## Non-goals

This package is not intended to contain:

- Express handlers.
- Database code.
- Backend services.
- React components.
- React hooks for UI state.
- Next.js route code.
- Electron main/preload code.
- Desktop IPC handlers.
- App-specific feature flows.
- Published external package infrastructure.

If code depends on a specific app or runtime, it probably does not belong in `@appkit/api-client`.

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

This package is part of the AppKit monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
