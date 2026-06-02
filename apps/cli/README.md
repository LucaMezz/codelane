# CodeLane CLI

The CodeLane CLI (`codelane`) is a first-class interface for CodeLane — not a companion tool bolted on after the fact. Developers who prefer to stay in the terminal should be able to do everything through the CLI: view and create issues, triage their queue, transition statuses, and eventually kick off complete development workflows with a single command.

The CLI is intentionally isolated from the web and desktop apps. It stays terminal-focused, avoids React and UI dependencies, and communicates with the API through `@codelane/api-client`.

## Overview

`apps/cli` owns all terminal-facing behavior for CodeLane:

- command registration and terminal UX
- browser-based CLI authentication (PKCE flow with localhost callback)
- local CLI config storage (API URL, web URL, user metadata)
- local credential storage abstraction (refresh tokens, access tokens)
- access token refresh and lifecycle management
- future: issue listing, creation, status transitions, and Git branch workflows

It does not import from `@codelane/ui`, `@codelane/frontend`, `apps/web`, `apps/desktop`, or `apps/api`.

## Commands

### Authentication

```bash
codelane login                                          # Authenticate via browser (PKCE flow)
codelane login --no-browser                             # Print auth URL instead of opening browser
codelane login --api-url http://localhost:4000 \
               --web-url http://localhost:3000          # Point to a specific server
codelane whoami                                         # Show the currently authenticated user
codelane auth status                                    # Show token and session state
codelane logout                                         # Sign out and revoke credentials
```

### Status and navigation

```bash
codelane status                                         # Show your current focus and assigned work
```

### Planned — issue workflows

The following commands are planned as core issue tracking features are built:

```bash
codelane issues list                                    # List issues with optional filters
codelane issues create                                  # Create a new issue
codelane issues view <id>                               # View an issue in the terminal
codelane start <id>                                     # Assign, transition to In Progress, and branch
```

The `codelane start` command is the target developer experience: one command that assigns the issue, moves it to In Progress, creates a Git branch, and checks it out — without leaving the terminal.

### Development

During local development, run commands through pnpm:

```bash
pnpm --filter @codelane/cli dev -- login
pnpm --filter @codelane/cli dev -- whoami
pnpm --filter @codelane/cli dev -- auth status
pnpm --filter @codelane/cli dev -- logout
```

## Package structure

```text
apps/cli/
├── src/
│   ├── auth/          # PKCE, callback server, token manager, credential/config stores
│   ├── commands/      # Commander command registration
│   ├── lib/           # CLI metadata and small helpers
│   └── index.ts       # CLI entry point
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Authentication

The CLI uses a browser-based native app flow:

1. `codelane login` generates `state`, `code_verifier`, and `code_challenge`.
2. The CLI starts a temporary localhost callback server.
3. The CLI opens the web app authorization page.
4. The browser uses the normal web session or sign-in flow.
5. The user approves CLI access.
6. The browser redirects to the localhost callback with an authorization code.
7. The CLI verifies `state`.
8. The CLI exchanges the code plus PKCE verifier with the API.
9. The CLI stores a refresh token through `CredentialStore`.
10. Future API calls use short-lived access tokens refreshed from the refresh token.

See [CLI authentication](../../docs/cli-auth.md) for a full security and flow explanation.

## Storage

The CLI separates non-secret config from secret credentials.

Non-secret config includes:

- API URL
- web URL
- last signed-in user metadata

Secret storage currently uses the `CredentialStore` abstraction. The implementation includes a filesystem fallback and warns when it is used. Production distributions should replace it with an OS credential store implementation.

## Environment variables

```bash
CODELANE_API_URL=http://localhost:4000
CODELANE_WEB_URL=http://localhost:3000
```

CLI flags take precedence over environment variables. Environment variables take precedence over saved config.

## Scripts

```bash
pnpm --filter @codelane/cli dev
pnpm --filter @codelane/cli build
pnpm --filter @codelane/cli typecheck
pnpm --filter @codelane/cli test:run
pnpm --filter @codelane/cli knip
```

## Development guidelines

- Keep command files focused on terminal UX and orchestration.
- Put reusable auth helpers under `src/auth`.
- Use `@codelane/api-client` for API calls.
- Use `@codelane/core` for shared request/response types.
- Use `@codelane/config` for URL and port defaults.
- Do not import frontend routes, UI components, or app implementation files.
- Keep secrets out of logs.
- Add tests for PKCE, token manager behavior, state verification, and error cases.

## Quality checks

```bash
pnpm --filter @codelane/cli typecheck
pnpm --filter @codelane/cli test:run
pnpm --filter @codelane/cli build
pnpm deps:arch
pnpm check
```

## License

This app is part of the CodeLane monorepo and is licensed under the Apache License 2.0. See the root `LICENSE` file for details.
