# Contributing to AppKit

Thank you for taking the time to improve AppKit. This project is a TypeScript monorepo starter kit, so good contributions are not only about making code work. They should also keep package boundaries clear, shared code reusable, and the developer workflow predictable.

## Project values

AppKit aims to be:

- maintainable over time
- clear about ownership boundaries
- practical for real product work
- friendly to web, desktop, API, and CLI contributors
- strict enough to catch mistakes early
- small enough that new contributors can understand where code belongs

When in doubt, prefer clarity over cleverness.

## Code of conduct

All contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

Please do not open public issues for security vulnerabilities. Follow the process in [SECURITY.md](./SECURITY.md).

## Prerequisites

Install:

- Node.js 22 or newer
- pnpm 10 or newer
- Git
- Docker, if you are working on API/database flows

The repository uses pnpm workspaces. Do not use npm or Yarn lockfiles.

## Getting started

```bash
pnpm install
```

Start everything through Turborepo:

```bash
pnpm dev
```

Or start individual apps:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:desktop
pnpm dev:cli
pnpm dev:ui
```

## Repository map

```text
apps/
  api/          Express API and database-owned backend code
  cli/          Command-line interface
  desktop/      Electron desktop app
  web/          Vite React web app

packages/
  api-client/   Shared API request helpers
  config/       Shared config defaults, env parsing, URL helpers
  core/         Shared framework-agnostic schemas and domain logic
  frontend/     Shared React routes, pages, and frontend flows
  ui/           Shared React UI components and Storybook
```

## Where should code go?

Use this decision guide:

```text
Is it deployable runtime code?
  Put it in apps/<target>.

Is it reusable UI?
  Put it in packages/ui.

Is it a shared route, page, auth flow, form wiring, or frontend application flow?
  Put it in packages/frontend.

Is it framework-agnostic validation, schema, type, or domain logic?
  Put it in packages/core.

Is it reusable API communication?
  Put it in packages/api-client.

Is it shared runtime config, env parsing, URL helpers, ports, or origin defaults?
  Put it in packages/config.
```

Avoid importing implementation code from one app into another app. If two places need the same code, move that code into an appropriate package.

## Package boundary rules

The main rules are:

- apps must not import from other apps
- shared packages must not import deployable apps
- `@appkit/core` must stay framework-agnostic and runtime-neutral
- `@appkit/ui` must stay presentational and must not call the API directly
- `@appkit/frontend` owns shared frontend flows
- `@appkit/api-client` owns reusable API communication
- `@appkit/config` owns shared config defaults and helpers
- CLI code must not depend on UI or shared frontend packages
- generated build output must not be imported by source files

Run architecture checks with:

```bash
pnpm deps:arch
```

For a more detailed report:

```bash
pnpm deps:arch:summary
```

## Development workflow

1. Create a branch.
2. Keep changes focused.
3. Add or update tests where behavior changes.
4. Update docs when behavior, commands, setup, config, or architecture changes.
5. Run the relevant checks locally.
6. Commit with a Conventional Commit message.
7. Open a pull request using the template.

## Branch naming

Use short, descriptive branch names:

```text
feat/cli-auth
fix/web-login-return-url
docs/contributing-guide
chore/update-dependencies
```

## Commit messages

This repo uses Conventional Commits.

Use the interactive commit prompt:

```bash
pnpm commit
```

Examples:

```text
feat(cli): add browser login flow
fix(api): reject consumed cli auth codes
docs(repo): add contribution guide
test(cli): cover token refresh rotation
chore(deps): update workspace packages
```

## Pull requests

Good pull requests:

- explain what changed and why
- keep unrelated refactors out of feature work
- mention migrations, config changes, or breaking behavior
- include screenshots or terminal output for UI/CLI changes when useful
- list the checks that were run
- call out known limitations or follow-up work

Use the existing pull request template and be honest about skipped checks.

## Local checks

Run the normal check pipeline:

```bash
pnpm check
```

Run tests:

```bash
pnpm test:run
```

Run the stronger validation set:

```bash
pnpm verify
```

`pnpm verify` runs static checks first, then tests/builds. It is the best local confidence check before a larger PR.

## CI checks

CI currently validates:

- pnpm lockfile only
- dependency version consistency
- dependency architecture
- package/app builds
- Knip
- formatter, lint, hardcoded local URL guard, and typecheck
- tests
- Storybook build
- desktop packaging on macOS and Windows

## Formatting and linting

Format and lint through:

```bash
pnpm check
```

This runs:

- `pnpm format`
- `pnpm lint`
- `pnpm lint:no-hardcoded-local-urls`
- `pnpm typecheck`

Do not add hardcoded local URLs, ports, or API base URLs outside approved config/docs locations. Shared defaults belong in `@appkit/config`.

## Dependency management

When adding a dependency:

1. Add it to the package that actually uses it.
2. Use `workspace:*` for internal packages.
3. Run:

   ```bash
   pnpm deps:lint
   ```

4. If syncpack reports drift:

   ```bash
   pnpm deps:fix
   pnpm install
   ```

Do not add package manager lockfiles other than `pnpm-lock.yaml`.

## Database changes

API database schema lives in `apps/api/src/db/schema`.

When changing schema:

```bash
pnpm db:generate
pnpm db:migrate
```

Commit generated migrations and metadata. Document any migration impact in the PR.

## Testing guidance

Add tests at the level that gives the clearest signal:

- pure helpers and schema behavior: unit tests
- API services and route behavior: API tests
- API client behavior: mocked fetch/client tests
- shared UI behavior: component or Storybook interaction tests
- CLI behavior: command/helper tests with mocked APIs where possible

Do not rely on a live service when a deterministic unit test will do.

## Documentation guidance

Update docs when you change:

- setup steps
- commands
- environment variables
- API routes or auth flows
- database migrations
- app/package ownership boundaries
- public package exports
- CLI behavior
- security-relevant behavior

Useful docs live in:

- `README.md`
- app/package READMEs
- `docs/`
- `.github/`

## Accessibility and UX

For UI work:

- prefer semantic HTML
- preserve keyboard access
- keep visible focus states
- use shared UI primitives where appropriate
- add or update Storybook stories for reusable components
- verify text and controls work at desktop and mobile sizes

## Reporting bugs

Use the bug report issue template and include:

- expected behavior
- actual behavior
- reproduction steps
- relevant logs or screenshots
- OS/browser/runtime details
- package/app area, if known

## Requesting features

Use the feature request issue template and explain:

- the user problem
- proposed behavior
- affected apps/packages
- alternatives considered
- whether it changes public APIs, config, docs, or migrations

## License

By contributing, you agree that your contributions are licensed under the Apache License 2.0, the same license as this repository.
