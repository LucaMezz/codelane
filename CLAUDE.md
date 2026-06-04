# Claude Code Instructions — CodeLane

## What this file is for

This file guides Claude Code sessions working in the CodeLane repository. It assumes you have already read the root [README.md](./README.md), which contains the authoritative documentation for the monorepo structure, package boundaries, tooling, and common commands. Do not duplicate that content here.

This file covers:

- What CodeLane is building as a product
- What each app and package is responsible for, concisely
- Where to put new code for specific kinds of changes
- Quality gates to run before committing
- Patterns to follow and anti-patterns to avoid

---

## Product vision

CodeLane is a **developer-centric task management and issue tracking application**. It is not a generic project management tool with developer features bolted on. It is designed specifically for software developers.

The core direction:

- **Keyboard-first** issue tracking — every action should be reachable without a mouse
- **Vim-style navigation** as an optional power-user layer (j/k navigation, g shortcuts, etc.)
- **Command palette** driven workflows — a central command palette for navigating, creating, triaging, and acting on issues
- **Fast issue creation and triage** — minimal friction for capturing bugs, TODOs, tasks, PR follow-ups, and technical work
- **Developer-focused views** — "My Focus", "Blocked", "Waiting for Review", "Assigned to Me", "PRs needing review"
- **Excellent Markdown and code-block support** — issues should render and edit Markdown natively
- **CLI-first workflows** — the `codelane` CLI should be a first-class way to interact with issues
- **Clean, fast, dense but beautiful UI** — closer to a developer command center than a Kanban board
- **Deep Git/GitHub integration eventually** — issue branches, PR links, status transitions tied to git state

The "developer love" moment to work toward:

```
codelane start CL-123
```

Where CodeLane assigns the issue, moves it to In Progress, creates/checks out a branch, links PR context, and prepares the developer to start coding.

**AI assistance** should only be introduced once core workflows are excellent — and only where it reduces admin work (summarising issues, extracting repro steps, suggesting labels, finding duplicates, generating acceptance criteria). Never add AI as a gimmick.

---

## Monorepo structure

See [README.md — Repository structure](./README.md#repository-structure) for the full layout.

Quick reference:

| Path                   | Package name           | Purpose                                                                                 |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `apps/api/`            | `@codelane/api`        | Express 5 backend API, PostgreSQL via Drizzle ORM, Auth.js                              |
| `apps/web/`            | `@codelane/web`        | Vite + React 19 SPA — thin platform host, delegates to `@codelane/frontend`             |
| `apps/desktop/`        | `@codelane/desktop`    | Electron 42 app — main/preload/renderer architecture, delegates to `@codelane/frontend` |
| `apps/cli/`            | `@codelane/cli`        | Commander CLI, PKCE auth flow, local credential storage                                 |
| `packages/core/`       | `@codelane/core`       | Framework-agnostic: domain types, Zod schemas, pure utilities                           |
| `packages/config/`     | `@codelane/config`     | Ports, URLs, env var names, server/client config parsing                                |
| `packages/frontend/`   | `@codelane/frontend`   | Shared React routes, pages, auth guards — used by web and desktop renderer              |
| `packages/ui/`         | `@codelane/ui`         | Shared React UI primitives (shadcn/ui base), Storybook, Tailwind 4                      |
| `packages/api-client/` | `@codelane/api-client` | Typed client helpers for calling the API — used by frontend and CLI                     |

---

## Architecture rules (enforced by dependency-cruiser)

These are hard constraints — the CI will fail if they are violated:

- Apps must not import from other apps
- `packages/core` must remain framework-agnostic (no React, Electron, Express, browser APIs)
- `packages/ui` must not import app code or server-only modules
- `packages/api-client` must not import app code
- `packages/frontend` must not import app code
- `packages/config` must not import app-level or UI/frontend code
- `apps/cli` must not import UI, `@codelane/frontend`, or any app
- No imports of generated build output (`dist/`, `.vite/`, `.next/`, `out/`)

Verify anytime you add a new cross-package import:

```bash
pnpm deps:arch
```

---

## Where to put new code

### New API route or module

Add a new module directory under `apps/api/src/modules/`:

```
apps/api/src/modules/issues/
├── issues.routes.ts       # Express router, route definitions
├── issues.controller.ts   # Request/response handling, calls service
└── issues.service.ts      # Business logic, DB queries via Drizzle
```

Register the router in `apps/api/src/app.ts`.

If the module introduces new database tables, add schema files under `apps/api/src/db/schema/` and run:

```bash
pnpm db:generate   # generate migration
pnpm db:migrate    # apply to database
```

### New database table or schema change

1. Add or edit a schema file in `apps/api/src/db/schema/`
2. Re-export it from `apps/api/src/db/schema/index.ts`
3. Run `pnpm db:generate` to generate the SQL migration
4. Run `pnpm db:migrate` to apply it
5. Never edit generated migration files manually

### New shared domain type, Zod schema, or pure utility

Put it in `packages/core/src/`. Export it from `packages/core/src/index.ts` or a new sub-path export if the category warrants it.

Example: a new `IssueStatus` enum and its Zod schema go in `packages/core/src/issue/`.

### New frontend page or route

1. Add the page component in `packages/frontend/src/pages/<section>/`
2. Add the route to the router in `packages/frontend/src/routes.tsx`
3. The page is automatically available in both `apps/web` and `apps/desktop`

### New reusable UI component

Add it to `packages/ui/src/components/`. Use shadcn/ui patterns for primitives. Add a Storybook story alongside it.

Do not add CodeLane-specific product components (e.g. `IssueCard`) to `@codelane/ui` — those belong in `@codelane/frontend`. The `ui` package should stay generic.

### New API client method

Add it in `packages/api-client/src/` under the relevant domain folder. Export from `packages/api-client/src/index.ts`.

### New CLI command

Add a command file to `apps/cli/src/commands/` and register it in `apps/cli/src/commands/index.ts`. Use the Commander pattern already established (see `apps/cli/src/commands/login.ts` for reference). Use `@codelane/api-client` for API calls; do not call the API directly from CLI source.

### New Electron IPC channel

Define the contract in `apps/desktop/shared/`. Implement the handler in `apps/desktop/main/`. Expose it via `apps/desktop/preload/`. Do not call Node APIs directly from the renderer — always go through the preload bridge.

### New app-specific component (not shared)

If a component is truly specific to one app's platform concerns (e.g. desktop window chrome, CLI output formatting), keep it inside that app. Don't push it into shared packages prematurely.

---

## Development commands

See [README.md — Common commands](./README.md#common-commands) for the full list. Quick reference:

```bash
# Start all dev servers (API, web, desktop, CLI watch)
pnpm dev

# Start specific apps
pnpm dev:api          # API only
pnpm dev:web          # Web only
pnpm dev:desktop      # Electron only
pnpm dev:cli          # CLI in watch mode
pnpm dev:ui           # Storybook for @codelane/ui
pnpm dev:packages     # Watch-build shared packages (useful for package dev)

# Database (requires Postgres running)
pnpm db:up            # Start PostgreSQL via Docker
pnpm db:generate      # Generate Drizzle migration from schema changes
pnpm db:migrate       # Apply pending migrations
pnpm db:studio        # Open Drizzle Studio

# Docker
pnpm docker:up        # Start all Docker services
pnpm docker:down      # Stop all Docker services
```

---

## Quality gates — run before committing

```bash
pnpm check            # format + lint + typecheck (all packages)
pnpm test:run         # run all tests
pnpm knip             # detect unused exports/dependencies
pnpm deps:lint        # check dependency version consistency
pnpm deps:arch        # check architecture boundary rules
```

The pre-push Lefthook hook runs `test:run`, `package`, and `similarity-ts` automatically. CI enforces all of the above.

Use the interactive commit prompt (which runs commitlint via Lefthook):

```bash
pnpm commit
```

Commit message format: `feat(api): add issue status endpoint`, `fix(web): handle empty issue list`, etc.

---

## CodeLane product conventions

### Issue/task domain model

When building the issue tracking domain, keep these principles:

- Domain types and validation schemas belong in `packages/core/src/issue/` (or similar)
- Database schema for issues lives in `apps/api/src/db/schema/`
- Business logic (status transitions, assignment rules, etc.) lives in `apps/api/src/modules/issues/issues.service.ts`
- API contracts (request/response shapes) are defined with Zod in `packages/core` and reused across API and frontend
- Avoid duplicating status enums or field names between the API schema and the frontend — share them through `@codelane/core`

### Keyboard-first UI conventions

- Every interactive element should have a keyboard shortcut or be reachable via the command palette
- Use `cmdk` or a similar command palette library — add command palette infrastructure early so features register into it naturally
- Use standard keyboard conventions: `j/k` for list navigation, `Enter` to open, `Escape` to dismiss, `?` for shortcuts help
- Avoid modal dialogs for common actions; prefer inline editing, slide-overs, or command inputs
- Do not build a feature that is mouse-only

### React component conventions

- Keep components in `@codelane/frontend` focused on product features; keep `@codelane/ui` focused on reusable primitives
- Don't put domain logic inside React components — extract to service functions, hooks, or `@codelane/core` utilities
- Use `react-hook-form` (already a dependency) for all form state
- Prefer derived state over redundant state; don't mirror server state unnecessarily in component state

### Import style in `packages/frontend`

Always use the `#`-prefixed package imports defined in `package.json`'s `"imports"` map instead of `../` relative chains when importing across directories:

```ts
// ✓ prefer
import { useAuthSession } from "#components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "#config";

// ✗ avoid
import { useAuthSession } from "../../../components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "../../../config";
```

Same-directory relative imports (`./sibling`) are still fine. When adding a new top-level source file that will be imported by many pages, add a corresponding `#`-alias to `packages/frontend/package.json`'s `"imports"` field.

### API conventions

- Use the module pattern: `<domain>.routes.ts` → `<domain>.controller.ts` → `<domain>.service.ts`
- Validate all request bodies and query params with Zod in the controller
- Use `requireAuth` middleware for protected routes
- Return consistent error shapes — the error middleware already handles `ZodError` and generic errors
- Do not put database queries directly in controllers

### Type safety

- Define API request/response types as Zod schemas in `packages/core`, infer TypeScript types from them
- Use those same schemas for validation in `apps/api` controllers and for type inference in `@codelane/api-client`
- This keeps the API contract single-sourced and type-safe end to end

---

## What to avoid

- **Generic Kanban clone thinking** — CodeLane is not Trello or Jira; build for developer workflows
- **Manager-first assumptions** — features like Gantt charts, resource planning, or timeline views are not the focus
- **Mouse-only interactions** — every feature needs keyboard access
- **Duplicating business logic** — if both the web app and CLI need the same logic, it belongs in `@codelane/core` or `@codelane/api-client`, not copy-pasted
- **Domain logic in React components** — extract it
- **Product-specific components in `@codelane/ui`** — that package should stay generic
- **Direct cross-app imports** — enforced by dependency-cruiser, will fail CI
- **Importing from `dist/` or other build outputs** — always import from source
- **AI features before core UX is excellent** — don't add AI assistance as a shortcut to avoid building good workflows
- **Casual technology replacement** — don't swap out Drizzle, Auth.js, Express, Vite, or other core dependencies without a strong reason and full discussion
- **Importing `@codelane/ui` or `@codelane/frontend` from `apps/cli`** — the CLI is terminal-only

---

## Existing documentation to read before making changes

| Document                                           | When to read it                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [README.md](./README.md)                           | Monorepo structure, tooling, getting started, architecture workflow, dependency management |
| [apps/api/README.md](./apps/api/README.md)         | API module structure, security guidelines, dependency boundaries                           |
| [apps/web/README.md](./apps/web/README.md)         | Vite config, routing, styling, relationship to shared packages                             |
| [apps/desktop/README.md](./apps/desktop/README.md) | Main/preload/renderer separation, IPC guidelines, Electron security                        |
| [apps/cli/README.md](./apps/cli/README.md)         | CLI commands, auth flow, credential storage                                                |
| [docs/cli-auth.md](./docs/cli-auth.md)             | Complete CLI OAuth2/PKCE authentication flow — read before touching any auth code          |

---

## Authentication notes

Auth is split across two concerns:

1. **Web/desktop session auth** — Auth.js (`@auth/express`) with a Credentials provider and Drizzle adapter. Sessions are stored in the database. The `ExpressAuth` handler mounts at `/auth` in `apps/api/src/app.ts`.

2. **CLI auth** — A custom PKCE + localhost callback OAuth2-style flow. The CLI opens a browser, the user approves access through the web app (`/cli/login` page in `@codelane/frontend`), and the browser redirects to a localhost callback server the CLI starts temporarily. The CLI then exchanges the code for tokens and stores them locally using the `CredentialStore` abstraction.

See [docs/cli-auth.md](./docs/cli-auth.md) for the complete flow, security properties, and token lifecycle.

Do not add new auth mechanisms without understanding both flows. Do not bypass `requireAuth` middleware in routes that expose user data.

---

## Environment variables

Copy `.env.example` to `.env` and populate it before running the API. Key variables:

| Variable                | Purpose                          | Default |
| ----------------------- | -------------------------------- | ------- |
| `API_PORT`              | API server port                  | 4000    |
| `WEB_PORT`              | Web dev server port              | 3000    |
| `DESKTOP_RENDERER_PORT` | Electron renderer dev port       | 5173    |
| `DATABASE_URL`          | PostgreSQL connection string     | —       |
| `AUTH_SECRET`           | Auth.js signing secret           | —       |
| `CORS_ORIGINS`          | Comma-separated allowed origins  | —       |
| `VITE_API_BASE_URL`     | API base URL for browser clients | —       |

Ports and local URL defaults are defined in `packages/config/src/defaults.ts` — use those values rather than hardcoding numbers.

---

## Adding a new CodeLane product feature (end-to-end example)

Example: adding an "Issues" feature with a list and detail view.

1. **Schema and types** (`packages/core/src/issue/`)
   - Define `Issue`, `IssueStatus`, `CreateIssueInput`, `UpdateIssueInput` as Zod schemas
   - Infer and export TypeScript types

2. **Database** (`apps/api/src/db/schema/issues.ts`)
   - Define the Drizzle table
   - Export from `apps/api/src/db/schema/index.ts`
   - Run `pnpm db:generate && pnpm db:migrate`

3. **API module** (`apps/api/src/modules/issues/`)
   - `issues.service.ts` — CRUD queries using Drizzle
   - `issues.controller.ts` — validate with Zod schemas from `@codelane/core`, call service
   - `issues.routes.ts` — define routes, apply `requireAuth`
   - Register router in `apps/api/src/app.ts`

4. **API client** (`packages/api-client/src/issues/`)
   - Add typed fetch helpers using schemas from `@codelane/core`
   - Export from `packages/api-client/src/index.ts`

5. **Frontend pages** (`packages/frontend/src/pages/issues/`)
   - Issue list page, issue detail page
   - Register routes in `packages/frontend/src/routes.tsx`
   - Use `@codelane/ui` primitives for components
   - Call API via `@codelane/api-client`

6. **Keyboard shortcuts**
   - Add shortcuts to the command palette registration
   - Implement `j/k` navigation in the issue list

7. **CLI command** (optional, `apps/cli/src/commands/issues.ts`)
   - `codelane issues list`, `codelane issues create`, etc.
   - Use `@codelane/api-client` for API calls

8. **Check everything**

   ```bash
   pnpm check
   pnpm test:run
   pnpm knip
   pnpm deps:arch
   ```

---

## Dependency conventions

- Internal workspace packages always use `workspace:*` as the version
- Never hardcode a local URL or port number — use `@codelane/config`
- New external dependencies: add only to the package that uses them; run `pnpm deps:lint` after
- Check for version drift with `pnpm deps:fix && pnpm install` if syncpack reports issues
- Major dependency upgrades require care — check Renovate's Dependency Dashboard first

# Committing changes

- When one or more changes to the codebase are requested, please group them appropriately into a number of commits
- Complete one group of changes, and then immediately commit the changes with a conventional commit message
- This commit message should adhere to the commitlint configuration in this repo at `commitlint.config.ts`
