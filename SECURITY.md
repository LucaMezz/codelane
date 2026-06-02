# Security Policy

Security issues are handled privately first. Please do not open public GitHub issues for vulnerabilities.

## Supported versions

AppKit is currently a starter kit and active development project. Security fixes are expected to target the current `main` branch unless a separate release/version support policy is introduced later.

| Version                | Supported         |
| ---------------------- | ----------------- |
| `main`                 | Yes               |
| older commits or forks | No formal support |

## Reporting a vulnerability

If GitHub private vulnerability reporting is enabled for this repository, please use it.

Otherwise, contact the repository maintainer privately through the GitHub profile or organization associated with the project.

Please include:

- a clear description of the vulnerability
- affected app/package, if known
- reproduction steps or proof of concept
- impact assessment
- whether credentials, tokens, sessions, database data, or user data are involved
- any suggested fix or mitigation

Do not include real user secrets, production credentials, or private data in a report. Use test data whenever possible.

## What to expect

After a report is received, maintainers should try to:

1. acknowledge the report
2. reproduce and assess the issue
3. decide severity and scope
4. prepare a fix privately when appropriate
5. release or merge the fix
6. credit the reporter if they want credit

Response times may vary because this is a template project, but reports that affect authentication, token handling, secrets, or remote code execution should be treated as high priority.

## Security-sensitive areas

Please be especially careful when changing:

- Auth.js configuration
- CLI authentication
- password hashing
- session handling
- refresh token storage or rotation
- authorization code handling
- database migrations involving users, accounts, sessions, or credentials
- CORS and allowed origins
- Electron main/preload/renderer boundaries
- IPC channels
- environment variable parsing
- Docker and deployment configuration
- logging of request bodies, tokens, headers, or secrets

## Local secrets

Never commit:

- `.env`
- database credentials
- API keys
- OAuth client secrets
- private certificates or signing keys
- production tokens
- local credential-store files

Use `.env.example` to document required variables without real values.

## Dependency security

When adding dependencies:

- prefer maintained packages
- avoid packages with unclear ownership for security-critical behavior
- add dependencies only to the package that uses them
- keep lockfile changes intentional
- run normal repository checks before merging

Renovate is used to help keep dependencies current.

## Auth and token guidance

For CLI and API auth flows:

- do not store raw passwords
- do not copy browser cookies into CLI storage
- do not store long-lived JWTs in plain JSON
- hash authorization codes and refresh tokens before database storage
- keep access tokens short-lived
- rotate refresh tokens where practical
- revoke sessions server-side on logout
- validate redirect URIs
- verify `state` and PKCE values

See [CLI authentication](./docs/cli-auth.md) for details about the current CLI auth design.

## Electron security guidance

For desktop changes:

- keep `contextIsolation` enabled
- avoid broad Node.js access in renderer code
- expose narrow preload APIs
- validate IPC payloads
- keep secrets out of renderer code
- avoid loading untrusted remote content without deliberate review

## Public disclosure

Please give maintainers a reasonable opportunity to fix a vulnerability before public disclosure. Coordinated disclosure helps protect users and downstream projects that may use this template.
