# AppKit Desktop

The AppKit desktop app is the cross-platform desktop client for the AppKit monorepo.

It is built as a desktop application that shares code with the rest of the workspace while keeping desktop-specific concerns isolated inside `apps/desktop`. The app is intended to demonstrate a professional Electron-style architecture with clear separation between main-process code, preload code, renderer code, shared IPC contracts, and reusable workspace packages.

## Overview

`apps/desktop` is responsible for the desktop runtime and desktop-specific user experience.

It consumes shared workspace packages such as:

- `@appkit/ui`
- `@appkit/core`
- `@appkit/api-client`

Desktop-only code should remain inside this app. Code that can also be used by the web app or API client should be moved into `packages/*`.

## Role in the monorepo

The desktop app is one of the deployable application targets in the AppKit starter kit.

```text
apps/
  desktop/      Cross-platform desktop app

packages/
  ui/           Shared React UI components
  core/         Shared framework-agnostic logic
  api-client/   Shared API communication helpers
```

The desktop app may depend on shared packages, but shared packages should not depend on the desktop app.

## Architecture

The desktop app follows the standard Electron-style separation of responsibilities:

```text
apps/desktop/
├── main/             # Main process code
├── preload/          # Preload bridge between main and renderer
├── renderer/         # React renderer application
├── shared/           # Desktop-local shared types/contracts
├── package.json
└── README.md
```

### Main process

The main process owns desktop runtime responsibilities such as:

- Creating and managing application windows.
- Registering IPC handlers.
- Accessing Electron main-process APIs.
- Coordinating desktop-only behavior.

Main-process code should not import renderer-only React code.

### Preload

The preload layer is the controlled bridge between the renderer and the main process.

It should expose a narrow, typed API to the renderer instead of exposing broad Electron or Node.js access.

Preload code is the right place for:

- `contextBridge` APIs.
- Renderer-safe IPC wrappers.
- Controlled desktop capabilities.

### Renderer

The renderer is the React application shown inside the desktop window.

It can use shared UI and client packages:

```ts
import { Button } from "@appkit/ui";
import { apiClient } from "@appkit/api-client";
```

Renderer code should access desktop capabilities through the preload API, not by importing Electron main-process modules directly.

### Shared desktop contracts

The `shared/` folder is for desktop-local contracts used across main, preload, and renderer code.

This is especially useful for IPC types:

```text
shared/
  ipc/
    types.ts
```

Shared IPC types should stay lightweight and should not import runtime-specific modules from main or renderer code.

## Dependency boundaries

The desktop app follows these monorepo boundaries:

- The desktop app may import from shared packages.
- The desktop app must not import from `apps/web`.
- The desktop app must not import from `apps/api`.
- Shared packages must not import from the desktop app.
- Renderer code should not import Electron main-process modules directly.
- Source code should not import from generated build output such as `.vite`, `dist`, `out`, or `build`.

Architecture boundaries are enforced at the monorepo level with dependency-cruiser:

```bash
pnpm deps:arch
```

## Import conventions

### Cross-package imports

Use workspace package names for shared code:

```ts
import { Button } from "@appkit/ui";
import { someCoreHelper } from "@appkit/core";
import { apiClient } from "@appkit/api-client";
```

### Desktop-local imports

The desktop app can use local package imports or local aliases for desktop-only source code.

For example, desktop renderer code may import local renderer modules, while shared package code should use its own `package.json#imports` configuration.

### IPC imports

Prefer importing shared IPC contracts from `shared/` rather than duplicating string channels or payload types across main, preload, and renderer code.

Example:

```ts
import type { WindowChannel } from "../shared/ipc/types";
```

The exact import path may vary by layer, but the goal is to keep IPC contracts centralized.

## Scripts

Run commands from the repository root using pnpm filters.

### Start the desktop app in development

```bash
pnpm --filter @appkit/desktop dev
```

### Typecheck the desktop app

```bash
pnpm --filter @appkit/desktop typecheck
```

### Run desktop tests

```bash
pnpm --filter @appkit/desktop test:run
```

### Build desktop-related output

```bash
pnpm --filter @appkit/desktop build
```

### Package the desktop app

```bash
pnpm --filter @appkit/desktop package
```

or from the root package script:

```bash
pnpm package
```

The root command may run the desktop package task through Turborepo as part of the broader monorepo workflow.

## Development workflow

A typical desktop development flow is:

```bash
pnpm install
pnpm --filter @appkit/desktop dev
```

Before committing desktop changes, run:

```bash
pnpm check
pnpm knip
pnpm deps:arch
pnpm test:run
```

For a desktop-specific check, run:

```bash
pnpm --filter @appkit/desktop typecheck
pnpm --filter @appkit/desktop test:run
```

## Packaging workflow

The desktop app is packaged through the desktop package scripts.

A typical packaging flow is:

```bash
pnpm build
pnpm --filter @appkit/desktop package
```

The monorepo also has a root packaging command:

```bash
pnpm package
```

Packaging should be treated as a stronger validation step than development mode because it exercises production build output and Electron packaging behavior.

## Testing

The desktop app uses unit tests for desktop-specific utilities and behavior.

Run:

```bash
pnpm --filter @appkit/desktop test:run
```

Current tests should focus on small, deterministic modules first, such as:

- Error handling utilities.
- IPC contract helpers.
- Renderer utilities.
- Pure desktop helpers that do not require a live Electron runtime.

Full Electron end-to-end testing can be added later if needed.

## IPC guidelines

IPC is one of the most important boundaries in the desktop app.

Recommended rules:

- Define IPC channel names and payload types in shared desktop contracts.
- Keep IPC handlers small.
- Validate untrusted input at process boundaries.
- Avoid exposing raw Electron or Node APIs to the renderer.
- Prefer explicit preload methods over generic IPC send/invoke wrappers.
- Keep renderer code unaware of main-process implementation details.

Good IPC design makes the desktop app safer, easier to test, and easier to refactor.

## Security guidelines

Desktop applications have different security concerns from web-only apps.

Recommended practices:

- Keep `contextIsolation` enabled.
- Avoid enabling broad Node.js access in the renderer.
- Use preload APIs for controlled capabilities.
- Validate IPC payloads.
- Avoid passing secrets to renderer code.
- Keep main-process-only functionality out of React components.
- Treat renderer input as untrusted.

## Styling and UI

Shared UI should live in `@appkit/ui` when it can be reused by the web app.

Desktop-specific UI should stay in the desktop renderer.

Use this rule of thumb:

```text
Reusable across web and desktop?
  Put it in packages/ui.

Only meaningful for desktop window chrome, desktop navigation, or Electron behavior?
  Keep it in apps/desktop.
```

## Relationship to shared packages

The desktop app should consume shared packages through public package entry points:

```ts
import { Button } from "@appkit/ui";
```

Avoid deep imports into package internals unless there is a deliberate reason.

Good:

```ts
import { Button } from "@appkit/ui";
```

Avoid:

```ts
import { Button } from "../../packages/ui/src/components/button";
```

## Common issues

### Stale pnpm binary shims

If local `node_modules` folders contain stale binary shims, remove the affected app-local `node_modules` folder and reinstall from the repo root:

```powershell
Remove-Item -Recurse -Force .\apps\desktop\node_modules
pnpm install
```

### Knip reports root-provided binaries

Some tools, such as `tsgo`, may be intentionally provided from the workspace root. If Knip reports a root-provided binary as unlisted, document and ignore it in the package-level Knip config rather than duplicating tooling dependencies unnecessarily.

### Renderer import cannot resolve

Check whether the import is:

- A desktop-local renderer import.
- A shared workspace package import.
- A package-internal `#/*` import that belongs inside a shared package.
- A generated build output import that should not exist.

### Packaged app behaves differently from dev mode

Packaging exercises production bundles and Electron Forge output. When packaging issues happen, inspect:

- Renderer build output.
- Main/preload build output.
- Electron Forge config.
- Asset paths.
- Generated package contents.
- Runtime logs from the packaged app.

## Design goals

The desktop app is designed to be:

- **Cross-platform**: suitable for Windows, macOS, and Linux packaging workflows.
- **Separated by runtime**: main, preload, and renderer concerns stay distinct.
- **Shared-code friendly**: consumes workspace packages without duplicating logic.
- **Safe by default**: renderer access to desktop capabilities goes through preload APIs.
- **Maintainable**: IPC contracts and desktop-specific responsibilities are centralized.
- **Monorepo-aware**: integrates with Turborepo, pnpm workspaces, Knip, dependency-cruiser, syncpack, and CI checks.

## Non-goals

The desktop app should not become a dumping ground for shared application logic.

If logic is reusable across platforms, move it into a shared package. If logic is specific to the backend, keep it in `apps/api`. If logic is specific to the web app, keep it in `apps/web`.

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
