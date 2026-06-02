# @appkit/frontend

`@appkit/frontend` contains shared React application routes, pages, guards, and frontend flows used by AppKit frontend hosts.

The package exists so deployable apps such as `apps/web` and the desktop renderer can stay thin. App-level hosts provide runtime setup, while shared screens and flows live here.

## Overview

This package owns frontend application behavior that is reusable across browser and desktop-renderer environments:

- route definitions
- shared pages
- auth guards
- frontend runtime config context
- form wiring
- shared auth/login flows
- CLI authorization web flow

It can depend on:

- `@appkit/ui`
- `@appkit/core`
- `@appkit/api-client`
- React frontend libraries

It must not depend on deployable app implementation code.

## Role in the monorepo

```text
apps/
  web/          Thin Vite React host
  desktop/      Desktop app with renderer host

packages/
  frontend/     Shared React routes, pages, and frontend flows
  ui/           Shared UI components
  core/         Shared schemas and domain logic
  api-client/   Shared API communication helpers
  config/       Shared URL/config helpers
```

The intended direction is:

```text
apps/web or desktop renderer -> @appkit/frontend -> @appkit/ui
                                      |
                                      -> @appkit/api-client -> @appkit/core
```

## Package structure

```text
packages/frontend/
├── src/
│   ├── components/    # Shared frontend flow components and route guards
│   ├── pages/         # Shared pages and route-level screens
│   ├── config.tsx     # Frontend runtime config provider
│   ├── routes.tsx     # Shared route tree creation
│   └── index.ts       # Public package exports
├── package.json
├── tsconfig.json
└── README.md
```

## What belongs here

Good candidates:

- route guards such as protected and guest-only route wrappers
- shared login and sign-up page flows
- dashboard shell/page composition that applies to multiple frontend hosts
- frontend-side API flow wiring
- shared pages that use `@appkit/ui`, `@appkit/core`, and `@appkit/api-client`
- browser-compatible auth flows such as `/cli/login`

## What does not belong here

Avoid:

- deployable app bootstrapping
- Vite config
- Electron main/preload code
- backend API implementation
- database code
- reusable low-level UI primitives
- CLI code
- Node-only utilities

Use:

```text
Reusable UI primitive?
  packages/ui

Shared route/page/frontend flow?
  packages/frontend

Deployable host setup?
  apps/web or apps/desktop

Backend runtime behavior?
  apps/api

Terminal behavior?
  apps/cli
```

## Runtime config

Frontend hosts provide runtime configuration when creating routes:

```tsx
const routes = createRoutes(<Layout />, {
  apiBaseUrl: env.apiBaseUrl,
});
```

Shared pages read this through `useFrontendRuntimeConfig`.

## Scripts

```bash
pnpm --filter @appkit/frontend typecheck
pnpm --filter @appkit/frontend knip
```

The package is source-consumed by app hosts and participates in root checks.

## Development guidelines

- Keep route and page code readable.
- Move reusable UI primitives to `@appkit/ui`.
- Move shared schemas to `@appkit/core`.
- Move API request helpers to `@appkit/api-client`.
- Keep host-specific setup in apps.
- Avoid Electron-only and Node-only APIs.
- Preserve route query params when they are part of an auth or callback flow.

## Quality checks

```bash
pnpm --filter @appkit/frontend typecheck
pnpm deps:arch
pnpm check
pnpm knip
```

## License

This package is part of the AppKit monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
