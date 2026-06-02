# AppKit Web

The AppKit web app is the browser-based frontend application for the AppKit monorepo.

It is built with Vite, React, and React Router. The app is intentionally thin: it hosts shared frontend routes and flows from `@appkit/frontend`, imports shared UI styles, and provides browser runtime configuration.

## Overview

`apps/web` is responsible for the browser runtime and web-specific user experience.

It consumes shared workspace packages such as:

- `@appkit/ui`
- `@appkit/frontend`
- `@appkit/config`

Web-specific runtime host code should remain inside `apps/web`. Shared route/page/flow code should live in `@appkit/frontend`.

## Role in the monorepo

The web app is one of the deployable application targets in the AppKit starter kit.

```text
apps/
  web/          Browser frontend application
  desktop/      Cross-platform desktop application
  api/          Shared backend API application

packages/
  ui/           Shared React UI components
  frontend/     Shared frontend routes/pages/flows
  core/         Shared framework-agnostic logic
  api-client/   Shared API communication helpers
  config/       Shared config defaults and helpers
```

The web app should communicate with the backend through stable API contracts, preferably using helpers from `@appkit/api-client` where appropriate.

It should not import backend implementation files directly.

## Architecture

The web app follows a Vite React host structure.

```text
apps/web/
├── src/               # Vite React host entry, layout, env config
├── public/            # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── postcss.config.mjs
└── README.md
```

Most reusable application screens and routes live in `@appkit/frontend`.

## Key files and folders

### `src/`

The `src/` folder contains the Vite React app host.

Important files include:

```text
src/
  app.tsx
  main.tsx
  layout.tsx
  config/env.ts
```

Recommended conventions:

- Keep host code thin.
- Create routes through `@appkit/frontend`.
- Move cross-platform UI into `@appkit/ui`.
- Move shared frontend flows into `@appkit/frontend`.
- Move config defaults into `@appkit/config`.

### `public/`

Static assets for the web app.

Use this for files that should be served directly by Vite, such as images, icons, and other static assets.

### `vite.config.ts`

Vite configuration.

This is the right place for web-specific Vite options such as:

- Workspace package transpilation.
- React plugin configuration.
- Dev server configuration.
- Build configuration.

### `postcss.config.mjs`

PostCSS configuration used by the web app styling pipeline.

## Dependency boundaries

The web app follows these monorepo boundaries:

- The web app may import from `@appkit/ui`.
- The web app may import from `@appkit/frontend`.
- The web app may import from `@appkit/config`.
- The web app must not import from `apps/api`.
- The web app must not import from `apps/desktop`.
- The web app must not import from `apps/cli`.
- The web app should stay a thin host and avoid direct imports from `@appkit/core` or `@appkit/api-client`.
- Shared packages must not import from the web app.
- Source code should not import generated build output such as `.next`, `dist`, `build`, or `out`.

Architecture boundaries are enforced at the repository level with dependency-cruiser:

```bash
pnpm deps:arch
```

## Import conventions

### Cross-package imports

Use workspace package names for shared code:

```ts
import { createRoutes } from "@appkit/frontend";
import { defaultPorts } from "@appkit/config/client";
import { Button } from "@appkit/ui";
```

### Web-local imports

Web-local source code can use the web app's local import convention.

For example, if the app has local aliases configured:

```ts
import { SomeWebOnlyComponent } from "#/components/some-web-only-component";
```

or:

```ts
import { SomeWebOnlyComponent } from "@/components/some-web-only-component";
```

Use whichever convention is configured for `apps/web`, but avoid leaking app-local aliases into shared packages.

### Avoid app-to-app imports

Do not import from other apps:

```ts
// Avoid
import { serverThing } from "../../api/...";
import { desktopThing } from "../../desktop/...";
```

If code is needed by multiple apps, move it into a shared package.

## Shared UI usage

Reusable UI should come from `@appkit/ui`:

```tsx
import { Button } from "@appkit/ui";

export function Example() {
  return <Button>Continue</Button>;
}
```

Web-only components should stay in `apps/web`.

Use this rule of thumb:

```text
Reusable across web and desktop?
  Put it in packages/ui.

Specific to web routing, metadata, server rendering, or web-only UX?
  Keep it in apps/web.
```

## Styling

The web app uses the monorepo's frontend styling setup.

Shared component styling should live with `@appkit/ui` when the component is reusable across web and desktop.

Web-only styling should stay in `apps/web`.

Recommended guidelines:

- Prefer shared UI primitives from `@appkit/ui`.
- Keep route-specific layout and page composition in the web app.
- Avoid duplicating desktop renderer styles unless they are intentionally platform-specific.
- Move reusable styling utilities into `@appkit/ui`.

## Scripts

Run commands from the repository root using pnpm filters.

### Start the web app in development

```bash
pnpm --filter @appkit/web dev
```

### Build the web app

```bash
pnpm --filter @appkit/web build
```

### Typecheck the web app

```bash
pnpm --filter @appkit/web typecheck
```

### Run web tests

```bash
pnpm --filter @appkit/web test:run
```

### Run Knip for the web app

```bash
pnpm --filter @appkit/web knip
```

## Development workflow

A typical local web workflow is:

```bash
pnpm install
pnpm --filter @appkit/web dev
```

Before committing web changes, run:

```bash
pnpm check
pnpm knip
pnpm deps:arch
pnpm test:run
```

For web-specific validation:

```bash
pnpm --filter @appkit/web typecheck
pnpm --filter @appkit/web build
```

## Build workflow

The production web build is handled by Vite:

```bash
pnpm --filter @appkit/web build
```

The root build command may also build the web app through Turborepo:

```bash
pnpm build
```

A successful production build should verify that:

- Routes compile.
- TypeScript passes.
- Shared packages resolve correctly.
- Vite can produce optimized output.
- Workspace package imports are compatible with the web build.

## Routing guidelines

Shared route files should usually live in `@appkit/frontend`.

Recommended rules:

- Keep route components readable.
- Move reusable UI into components or `@appkit/ui`.
- Move business/domain logic into `@appkit/core` where possible.
- Move API communication helpers into `@appkit/api-client`.
- Keep `apps/web` focused on browser host setup.

## API communication

The web app should communicate with the backend through stable API contracts.

Prefer using `@appkit/frontend` flows that call `@appkit/api-client`, or add reusable request helpers to `@appkit/api-client`.

```ts
import { createRoutes } from "@appkit/frontend";
```

Avoid duplicating endpoint URLs, request shapes, and response handling across web and desktop clients.

If the API response shape needs to be shared, prefer moving framework-agnostic types or schemas into `@appkit/core`.

## Environment configuration

Web environment variables should be handled deliberately.

Recommended guidelines:

- Keep server-only values private.
- Only expose browser-safe values through the appropriate public environment variable mechanism.
- Avoid reading environment variables in many unrelated files.
- Document required environment variables as the app grows.

## Testing strategy

The web app can support multiple levels of testing:

```text
unit tests        pure utilities and components
integration tests route-level or client behavior
e2e tests         browser flows, added later when needed
```

At this stage, prioritize small deterministic tests first.

Potential test targets:

- Route rendering.
- Shared UI integration.
- API client usage.
- Web-specific utilities.
- Form behavior.
- Auth routing behavior.

## Relationship to `@appkit/ui`

The web app should use `@appkit/ui` for reusable components.

Good:

```ts
import { Button } from "@appkit/ui";
```

Avoid deep imports into package internals:

```ts
// Avoid
import { Button } from "../../../packages/ui/src/components/button";
```

If a UI component is only used by the web app and is not useful for desktop, keep it inside `apps/web`.

## Relationship to `@appkit/api-client`

Use `@appkit/api-client` for reusable client-side API communication.

This helps prevent the web and desktop apps from duplicating API request logic.

## Relationship to `@appkit/core`

Use `@appkit/core` for framework-agnostic shared logic, such as:

- Domain types.
- Pure helpers.
- Validation schemas.
- Constants.
- Shared data transformation logic.

Do not place React components, route logic, or browser-specific code in `@appkit/core`.

## Common issues

### Vite cannot resolve a workspace package

Check that the package is listed in `apps/web/package.json` using `workspace:*` and that the package exports the entry being imported.

### Shared package import fails

Check whether the package is listed in `apps/web/package.json` using `workspace:*`.

Example:

```json
{
  "dependencies": {
    "@appkit/ui": "workspace:*"
  }
}
```

Also check whether the package entry point is compatible with Vite's ESM resolution.

### App imports backend implementation files

Do not import from `apps/api/src`.

Move shared types or schemas into `@appkit/core`, then import them from there.

### Styling differs from desktop

If the same component should look the same in web and desktop, move it into `@appkit/ui`.

If the styling difference is platform-specific, keep it in the app-specific layer.

### Knip reports root-provided binaries

Some tooling binaries may be intentionally provided from the workspace root. If Knip reports one as unlisted, document and ignore it in the package-level Knip config rather than duplicating tooling dependencies unnecessarily.

## Quality checks

The web app participates in the root quality workflow:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm knip
pnpm check
pnpm test:run
pnpm build
```

The web app should remain compatible with:

- syncpack dependency consistency.
- dependency-cruiser architecture rules.
- Knip unused dependency/export detection.
- Oxlint/oxfmt linting and formatting.
- TypeScript typechecking.
- Turborepo task orchestration.
- Vite production builds.

## Design goals

The web app is designed to be:

- **Modern**: built with Vite, React, React Router, and TypeScript.
- **Thin**: delegates shared routes and flows to `@appkit/frontend`.
- **Shared-code friendly**: consumes shared UI, frontend, and config packages.
- **Deployable**: remains a standalone web application target.
- **Maintainable**: keeps app-specific code separate from reusable packages.
- **Monorepo-aware**: integrates with Turborepo, pnpm workspaces, Knip, syncpack, dependency-cruiser, Renovate, and CI.
- **Cross-platform aligned**: shares as much appropriate code as possible with the desktop renderer.

## Non-goals

The web app should not contain backend implementation details, desktop runtime logic, or reusable package internals.

If logic is reusable across platforms, move it into a shared package. If logic is specific to the backend, keep it in `apps/api`. If logic is specific to desktop runtime behavior, keep it in `apps/desktop`.

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
