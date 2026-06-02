# @appkit/ui

`@appkit/ui` is the shared React UI package for the AppKit monorepo.

It contains reusable components, hooks, styling utilities, global styles, and a Storybook component workbench that can be shared between the web app and the desktop renderer. The package is built around shadcn/ui-style component primitives and is intended to provide a consistent design foundation across AppKit's frontend targets.

## Overview

This package is responsible for shared frontend UI code.

It is used by:

- `apps/web`
- `apps/desktop`

It should contain UI code that is useful across frontend platforms, especially:

- Reusable React components.
- shadcn/ui-based primitives.
- Shared UI hooks.
- Shared styling utilities.
- Shared global CSS.
- Component-level styling conventions.
- Storybook stories and examples for shared components.

It should not contain app-specific route logic, desktop runtime code, backend code, database logic, or API implementation details.

## Role in the monorepo

`@appkit/ui` sits between the frontend applications and the rest of the shared packages.

```text
apps/
  web/          Browser frontend that consumes @appkit/ui
  desktop/      Desktop renderer that consumes @appkit/ui

packages/
  ui/           Shared React UI package and Storybook workbench
  core/         Shared framework-agnostic logic
  api-client/   Shared API communication helpers
```

The web and desktop apps should import reusable components from `@appkit/ui` instead of duplicating UI code.

## Package structure

```text
packages/ui/
├── .storybook/          # Storybook configuration for isolated UI previews
├── src/
│   ├── components/      # Shared React components and component stories
│   ├── hooks/           # Shared React hooks
│   ├── styles/          # Shared/global styles
│   ├── utils/           # Shared UI utilities
│   └── index.ts         # Public package entry point
│
├── package.json
├── components.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── knip.json
└── README.md
```

The exact structure may evolve, but the intent should stay the same: this package owns reusable frontend UI primitives, frontend-only utilities, shared styling foundations, and isolated component examples.

## Storybook

`@appkit/ui` includes Storybook for developing, previewing, documenting, and testing shared UI components independently from any consuming application.

Storybook is useful because it allows shared components to be viewed without running the web app or desktop app. This makes it easier to develop components in isolation, review visual states, document variants, and verify that the shared styling foundation works correctly.

Run Storybook from the repository root:

```bash
pnpm dev:ui
```

Build the static Storybook site:

```bash
pnpm build:ui
```

You can also run the package scripts directly:

```bash
pnpm --filter @appkit/ui storybook
pnpm --filter @appkit/ui storybook:build
```

Storybook is configured under:

```text
packages/ui/.storybook/
```

Important files include:

```text
.storybook/main.ts       Storybook framework, addons, and Vite configuration
.storybook/preview.ts    Global preview configuration and shared CSS imports
.storybook/vite-env.d.ts Vite type references for Storybook config/assets
```

## Story files

Stories should usually live next to the component they document.

Example:

```text
src/components/shadcn-ui/button.tsx
src/components/shadcn-ui/button.stories.tsx
```

Story files are source documentation and should be committed to git.

Generated Storybook output should not be committed. The static Storybook build output is usually:

```text
storybook-static/
```

That directory should remain ignored.

## Adding component stories

When adding stories for a shared component:

1. Add the story next to the component.
2. Use the package's real component source, not duplicated demo components.
3. Cover common variants, sizes, states, and realistic usage examples.
4. Prefer examples that demonstrate how the component is expected to be used in AppKit.
5. Avoid app-specific business flows unless the component is genuinely shared.
6. Run Storybook locally.
7. Build Storybook before merging larger UI changes.

Example story structure:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
```

Storybook files commonly use default exports for component metadata. This is expected by Storybook's Component Story Format.

## shadcn/ui registry stories

This package may use registry-provided stories for shadcn/ui-style components when they are useful and compatible with AppKit's setup.

When adding registry stories, verify that they are adapted to this package's Storybook framework:

```ts
import type { Meta, StoryObj } from "@storybook/react-vite";
```

Avoid importing from framework-specific Storybook packages that do not match this package, such as Next.js-specific Storybook packages.

Registry-generated stories should be reviewed before committing. In particular, check:

- Import paths use this package's component locations.
- The story uses `@storybook/react-vite` types.
- Styling matches the shared UI theme.
- Interaction tests do not conflict with lint/type rules.
- Unused generated demo files are removed.
- The stories build successfully in CI.

## What belongs in this package

Good candidates for `@appkit/ui`:

- Buttons.
- Inputs.
- Cards.
- Dialogs.
- Menus.
- Layout primitives.
- Shared navigation primitives.
- Form UI primitives.
- Shared hooks that are React/UI-specific.
- Styling helpers such as `cn`.
- Shared `globals.css`.
- Components adapted from or built on shadcn/ui.
- Stories for shared components.

Examples:

```text
src/components/shadcn-ui/button.tsx
src/components/shadcn-ui/button.stories.tsx
src/components/shadcn-ui/input.tsx
src/components/shadcn-ui/card.tsx
src/hooks/use-mobile.ts
src/utils/cn.ts
src/styles/globals.css
```

## What does not belong in this package

Avoid placing the following here:

- Next.js route files.
- Electron main-process code.
- Electron preload code.
- Express middleware.
- API route handlers.
- Database code.
- Backend auth configuration.
- Desktop-only window management code.
- Web-only page composition.
- App-specific feature workflows.
- Business logic that does not depend on React or UI.

Use the following rule of thumb:

```text
Reusable React UI?
  Put it in @appkit/ui.

Reusable non-UI logic?
  Put it in @appkit/core.

Reusable API communication?
  Put it in @appkit/api-client.

Specific to one app?
  Keep it in that app.
```

## shadcn/ui foundation

This package uses shadcn/ui-style components as the foundation for shared UI primitives.

shadcn/ui components are typically copied into the codebase rather than installed as a traditional component library. That makes them easy to customize and adapt to the application's design system.

In this package, shadcn/ui-based components should live under a clear location such as:

```text
src/components/shadcn-ui/
```

Examples:

```text
src/components/shadcn-ui/button.tsx
src/components/shadcn-ui/dropdown-menu.tsx
src/components/shadcn-ui/sidebar.tsx
src/components/shadcn-ui/card.tsx
src/components/shadcn-ui/input.tsx
```

These components should be exported through the package entry point when they are part of the public shared UI API.

## Public API

The public API of this package should be exported from:

```text
src/index.ts
```

Consumers should import from the package entry point:

```tsx
import { Button, Card } from "@appkit/ui";
```

Avoid deep imports from package internals:

```tsx
// Avoid
import { Button } from "@appkit/ui/src/components/shadcn-ui/button";
```

Deep imports make refactors harder and bypass the package's public API boundary.

## Internal import conventions

This package uses `package.json#imports` for package-local imports.

Use `#/*` for internal package imports:

```ts
import { cn } from "#/utils/cn";
import { useMobile } from "#/hooks/use-mobile";
import { Button } from "#/components/shadcn-ui/button";
```

This avoids collisions with app-local aliases such as `@/*`.

Recommended conventions:

- Use `#/*` only inside this package.
- Use `@appkit/ui` when importing this package from apps or other packages.
- Avoid using app-local aliases such as `@/*` inside shared packages.
- Prefer stable file/barrel boundaries over fragile deep relative paths.

## Global styles

This package includes shared global styles, including the main `globals.css`.

The global stylesheet is intended to provide the shared styling foundation for frontend apps and Storybook.

Typical responsibilities for global styles include:

- Tailwind/theme layer setup.
- Design tokens.
- CSS variables.
- Base styles.
- Shared light/dark theme variables.
- shadcn/ui-compatible styling foundations.

Apps that consume the UI package should import the shared global stylesheet where appropriate.

Example:

```ts
import "@appkit/ui/globals.css";
```

The exact export path depends on the package's configured `exports` field. If `globals.css` is intended to be consumed directly, make sure it is exported in `package.json`.

For example:

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./globals.css": "./src/styles/globals.css"
  }
}
```

If the file is emitted or copied to `dist` during build, the export can point to the built CSS output instead.

## Styling guidelines

Shared components should be styled consistently and should avoid app-specific assumptions.

Recommended guidelines:

- Use shared design tokens where possible.
- Prefer reusable component variants over one-off styles.
- Keep desktop-only styling inside `apps/desktop` when it is specific to desktop chrome or Electron behavior.
- Keep web-only styling inside `apps/web` when it is specific to web routing or browser-only UX.
- Use shared global styles for common theme variables and base styles.
- Avoid duplicating shadcn/ui primitives across apps.
- Add or update stories when adding important reusable component variants.

## Utility functions

Shared UI utilities live under:

```text
src/utils/
```

A common example is a `cn` helper for combining class names:

```ts
import { cn } from "#/utils/cn";
```

Utilities in this package should generally be UI-related.

If a utility is framework-agnostic and useful outside UI code, move it to `@appkit/core`.

## Hooks

Shared React hooks live under:

```text
src/hooks/
```

Hooks in this package should be frontend/UI-specific.

Good examples:

- `useMobile`
- layout-related hooks
- shared component behavior hooks
- responsive UI hooks

Avoid putting app workflow state, API business logic, or backend-specific behavior in this package.

## Peer dependencies

React and React DOM should be peer dependencies of this package.

That means consuming apps own the actual React runtime version.

This avoids bundling multiple React versions and keeps the package reusable across both web and desktop renderer apps.

Example:

```json
{
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

Development-only React dependencies may still exist for typechecking, local tests, Storybook, or component development, but runtime ownership belongs to the consuming app.

## Build output

This package is built into `dist`.

Typical build outputs include:

```text
dist/
  index.js
  index.cjs
  index.d.ts
```

The package build should be handled by the package scripts and coordinated by Turborepo.

Storybook's static build output is separate from the package build and is written to:

```text
storybook-static/
```

## Scripts

Run commands from the repository root using pnpm filters.

### Start Storybook

```bash
pnpm dev:ui
```

or:

```bash
pnpm --filter @appkit/ui storybook
```

### Build Storybook

```bash
pnpm build:ui
```

or:

```bash
pnpm --filter @appkit/ui storybook:build
```

### Build the UI package

```bash
pnpm --filter @appkit/ui build
```

### Typecheck the UI package

```bash
pnpm --filter @appkit/ui typecheck
```

### Run Knip for the UI package

```bash
pnpm --filter @appkit/ui knip
```

### Run tests

```bash
pnpm --filter @appkit/ui test:run
```

if tests are configured for this package.

## Development workflow

A typical workflow for changing shared UI components:

```bash
pnpm install
pnpm dev:ui
pnpm --filter @appkit/ui typecheck
pnpm --filter @appkit/ui build
pnpm build:ui
```

Then run a consuming app to verify the UI in context:

```bash
pnpm --filter @appkit/web dev
```

or:

```bash
pnpm --filter @appkit/desktop dev
```

Before committing:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm check
pnpm knip
pnpm test:run
```

For UI component changes, also run:

```bash
pnpm build:ui
```

## Using components in apps

Consumers should import shared UI from the public package entry point:

```tsx
import { Button, Card } from "@appkit/ui";

export function Example() {
  return (
    <Card>
      <Button>Continue</Button>
    </Card>
  );
}
```

If a component is missing from the public entry point, export it from `src/index.ts` rather than importing it through a deep path.

## Adding a new shared component

When adding a new reusable component:

1. Add the component under `src/components/`.
2. Use package-local imports with `#/*`.
3. Keep app-specific behavior out of the component.
4. Export the component from `src/index.ts` if it is part of the public UI package API.
5. Add or update Storybook stories when the component is part of the shared UI surface.
6. Run typecheck and build.
7. Verify it in Storybook and at least one consuming app.

Example:

```text
src/components/shadcn-ui/badge.tsx
src/components/shadcn-ui/badge.stories.tsx
```

Then export it:

```ts
export * from "#/components/shadcn-ui/badge";
```

Then consume it:

```tsx
import { Badge } from "@appkit/ui";
```

## Adding or modifying shadcn/ui components

When adding or modifying shadcn/ui-based components:

- Keep the component source in the shared UI package if it is reusable.
- Preserve compatibility with both web and desktop renderer environments.
- Avoid importing Next.js-specific APIs.
- Avoid importing Electron-specific APIs.
- Use shared utilities such as `cn` from this package.
- Export the component from the package entry point when it should be public.
- Add or update Storybook stories for the component's important states and variants.

If a shadcn/ui component is only relevant to one app, keep it in that app instead of this package.

## Dependency boundaries

`@appkit/ui` follows these rules:

- It may depend on React and frontend UI libraries.
- It may depend on `@appkit/core` if shared framework-agnostic logic is needed.
- It must not depend on `apps/web`.
- It must not depend on `apps/desktop`.
- It must not depend on `apps/api`.
- It should not depend on `@appkit/api-client` unless there is a deliberate reason.
- It should not import Node-only or Electron-only modules.
- It should not import generated build output.

Architecture boundaries are enforced at the root with:

```bash
pnpm deps:arch
```

## Relationship to `apps/web`

The web app consumes shared components from `@appkit/ui`.

If a component is reusable between web and desktop, it should live here.

If a component is specific to Next.js routing, metadata, server components, or web-only pages, it should stay in `apps/web`.

## Relationship to `apps/desktop`

The desktop renderer consumes shared components from `@appkit/ui`.

If a component is reusable between desktop and web, it should live here.

If a component is specific to Electron window chrome, desktop IPC, or desktop runtime behavior, it should stay in `apps/desktop`.

## Relationship to `@appkit/core`

Use `@appkit/core` for framework-agnostic logic.

If a helper does not depend on React, JSX, DOM APIs, CSS classes, or UI concerns, consider moving it to `@appkit/core`.

Good `@appkit/ui` utility:

```text
cn class name helper
```

Good `@appkit/core` utility:

```text
schema validation helper
domain model helper
pure formatting function shared by API and clients
```

## Testing strategy

UI package tests should focus on:

- Utility helpers.
- Hooks.
- Component behavior.
- Accessibility-critical interactions.
- Variant behavior.
- Shared styling assumptions where testable.
- Storybook interaction tests for component behavior where useful.

As the project grows, useful tests may include:

```text
unit tests          utilities and hooks
component tests     shared components
storybook tests     story-based interaction checks
visual tests        optional future enhancement
e2e tests           app-level flows in consuming apps
```

## Accessibility guidelines

Shared UI components should be accessible by default.

Recommended practices:

- Prefer semantic HTML.
- Preserve keyboard navigation.
- Use ARIA only when necessary.
- Keep focus states visible.
- Reuse accessible shadcn/ui patterns.
- Test interactive components with keyboard and screen-reader expectations in mind.
- Use Storybook's accessibility checks as an early feedback loop for shared components.

Because this package is shared, accessibility improvements benefit both web and desktop clients.

## Design guidelines

Shared components should be:

- Reusable.
- Composable.
- Accessible.
- Theme-aware.
- Platform-neutral.
- Small enough to understand.
- Free of app-specific workflows.
- Documented with useful examples when they are part of the shared UI API.

Avoid building large feature-specific components here unless they are genuinely shared across app targets.

## Common issues

### Component works in one app but not the other

Check whether the component depends on an app-specific API.

Common causes:

- Next.js-only APIs.
- Electron-only APIs.
- Browser-only globals used without guards.
- Missing shared global CSS import.
- Package export missing from `src/index.ts`.

### Storybook component appears unstyled

Check that:

- `.storybook/preview.ts` imports the shared `globals.css`.
- `.storybook/main.ts` configures `@tailwindcss/vite`.
- The Storybook dev server has been restarted after configuration changes.
- The component uses classes covered by the shared Tailwind/theme setup.

### Storybook cannot resolve CSS imports

Storybook's Vite environment should include Vite client types.

Check that this file exists:

```text
.storybook/vite-env.d.ts
```

with:

```ts
/// <reference types="vite/client" />
```

### Registry story references the wrong framework

Some external registry stories may use framework-specific imports such as:

```ts
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
```

For this package, use:

```ts
import type { Meta, StoryObj } from "@storybook/react-vite";
```

### Import from `#/*` fails

Check that:

- `package.json` has the correct `imports` field.
- `tsconfig.json` has matching `paths`.
- The import points to an actual file.
- The file extension/resolution mode is supported by the package's TypeScript configuration.

### Component is not available from `@appkit/ui`

Make sure it is exported from:

```text
src/index.ts
```

### Global styles are missing

Make sure the consuming app imports the shared stylesheet if required:

```ts
import "@appkit/ui/globals.css";
```

Also verify the CSS file is exported in `package.json` if it is imported through the package name.

### React version issues

React should be provided by the consuming app.

If React-related dependency warnings appear, check `peerDependencies`, app dependencies, and syncpack configuration.

## Quality checks

This package participates in the root quality workflow:

```bash
pnpm deps:lint
pnpm deps:arch
pnpm knip
pnpm check
pnpm test:run
pnpm build
pnpm build:ui
```

The package should remain compatible with:

- syncpack dependency consistency.
- dependency-cruiser architecture rules.
- Knip unused dependency/export detection.
- Oxlint/oxfmt linting and formatting.
- TypeScript/tsgo typechecking.
- Turborepo task orchestration.
- Storybook static builds.
- Web and desktop consuming app builds.

## Design goals

`@appkit/ui` is designed to be:

- **Reusable**: shared by web and desktop frontends.
- **Consistent**: provides common UI primitives and styling foundations.
- **Customizable**: built on shadcn/ui-style source components.
- **Documented**: includes Storybook stories for shared UI examples and component states.
- **Accessible**: shared components should be accessible by default.
- **Platform-neutral**: avoids web-only or desktop-only runtime assumptions.
- **Monorepo-aware**: follows AppKit package boundaries and import conventions.
- **Maintainable**: exports a clear public API and avoids deep internal imports.

## Non-goals

This package is not intended to contain:

- Backend code.
- Database code.
- API route handlers.
- Desktop main-process logic.
- Next.js route logic.
- App-specific feature workflows.
- Published external package infrastructure.

The package is designed for internal use inside the AppKit monorepo.

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
