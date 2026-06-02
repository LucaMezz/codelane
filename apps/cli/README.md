# CodeLane CLI

The CodeLane CLI is the command-line client for interacting with the CodeLane backend API.

It is intentionally separate from the web, desktop, and shared frontend packages. CLI code should stay terminal-focused, avoid React/UI dependencies, and communicate with the API through `@codelane/api-client`.

## Overview

`apps/cli` owns:

- command registration
- terminal command behavior
- browser-based CLI authentication orchestration
- localhost callback handling
- PKCE and state generation
- local CLI config storage
- local credential storage abstraction
- access token refresh behavior

It should not import from `@codelane/ui`, `@codelane/frontend`, `apps/web`, `apps/desktop`, or `apps/api`.

## Commands

```bash
codelane status
codelane login
codelane login --no-browser
codelane login --api-url http://localhost:4000 --web-url http://localhost:3000
codelane whoami
codelane auth status
codelane logout
```

During local development, run through pnpm:

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
APPKIT_API_URL=http://localhost:4000
APPKIT_WEB_URL=http://localhost:3000
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
