<div align="center">

<img src="./docs/assets/codelane-logo-text-transparent.png" alt="CodeLane logo" width="480" height="160" />

**Issue tracking built for how developers actually work.**

[![CI](https://github.com/LucaMezz/codelane/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/LucaMezz/codelane/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](./LICENSE)
[![pnpm](https://img.shields.io/badge/package%20manager-pnpm-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

CodeLane is a developer-centric task management and issue tracking application. It is not a Kanban board with a dark mode. It is not a project management suite with a developer plugin. It is built specifically for software developers, around the workflows they already live in — terminals, editors, Git, and pull requests.

The goal is to make issue tracking feel like part of the development workflow, not an interruption to it.

## The problem with existing tools

Most issue trackers are designed for managers to oversee developers, not for developers to use themselves. They are built around visual boards, mouse-driven workflows, and administrative hierarchies. Using them requires switching context away from the terminal and the editor, navigating slow web interfaces, and fighting tools that were never designed with the developer's flow in mind.

CodeLane is built from the other direction. It starts with how developers actually work and builds the issue tracker around that.

## What makes CodeLane different

### Keyboard-first, always

Every action in CodeLane is reachable without touching a mouse. Navigate issues with `j` and `k`, open with `Enter`, dismiss with `Escape`, and reach any workflow through the command palette. Vim-style navigation is a first-class feature, not an afterthought.

### Command palette driven

A central command palette gives instant access to every action: create an issue, change status, assign, label, filter, navigate to a view, or run a workflow — all without touching a menu.

### The CLI is a first-class interface

```bash
codelane start CL-123
```

This single command should assign the issue to you, move it to In Progress, create and check out a feature branch, and leave you ready to start coding — without opening a browser. The `codelane` CLI is designed to be a complete interface for developers who prefer to stay in the terminal.

### Developer-focused views

CodeLane surfaces the views developers actually need:

- **My Focus** — the issues you are actively working on
- **Assigned to Me** — everything in your queue
- **Waiting for Review** — your open PRs and issues awaiting feedback
- **Blocked** — issues stalled waiting on something external
- **PRs needing review** — work from teammates that needs your attention

### Excellent Markdown and code support

Issues are written in Markdown. Code blocks render with syntax highlighting. Reproduction steps, stack traces, and technical context are treated as first-class content — not plain text stuffed into a description field.

### Minimal friction for capturing work

Creating an issue should take seconds. Quick capture for bugs found mid-development, TODOs surfaced during code review, follow-up tasks from a PR comment, and technical debt notes all belong in CodeLane without ceremony.

### Clean, dense, fast UI

CodeLane is designed to feel closer to a developer's editor than a project management dashboard. The interface is information-dense, keyboard-navigable, and fast — it respects that developers are power users.

### Deep Git and GitHub integration (planned)

Issue branches, PR status transitions, commit references, and review state should flow naturally between CodeLane and Git. The goal is an issue tracker that understands where you are in the development lifecycle.

---

## Planned features

CodeLane is under active development. The planned feature set includes:

**Core issue tracking**

- Create, edit, and close issues with full Markdown support
- Labels, assignees, priorities, and milestones
- Status workflows: Backlog → Todo → In Progress → In Review → Done
- Comments, activity history, and issue relationships

**Keyboard and command palette**

- Full keyboard navigation across all views
- Vim-style `j/k` list navigation and `g` prefix shortcuts
- Global command palette for every action
- Customisable keyboard shortcuts
- Shortcut reference overlay (`?`)

**CLI workflows**

- `codelane issues list` — list and filter issues from the terminal
- `codelane issues create` — create an issue without opening a browser
- `codelane start <id>` — assign, transition, and branch in one command
- `codelane status` — see your current focus at a glance

**Developer views**

- My Focus, Assigned to Me, Waiting for Review, Blocked, In Review
- Filterable issue lists with saved filters
- Activity feed scoped to your work and your team

**Git and GitHub integration**

- Link issues to branches and pull requests automatically
- Status transitions triggered by PR events
- PR review status surfaced inside issue views
- `codelane start` creating and checking out branches

**Desktop app**

- Native app for macOS, Windows, and Linux
- System notifications for assignments and PR reviews

**Web app**

- Full browser-based interface
- Shareable issue links and team collaboration

**AI assistance** (later, once core workflows are excellent)

- Summarise long issue threads
- Extract reproduction steps from crash logs or error messages
- Suggest labels and assignees based on content
- Find duplicate issues before they are filed
- Generate acceptance criteria from descriptions

---

## Status

CodeLane is in early development. The monorepo architecture, authentication system, and cross-platform foundation are in place. Core issue tracking features are being built.

This is the repository where CodeLane is being built. Contributions, feedback, and early interest are welcome.

---

## Getting started (development)

### Prerequisites

- Node.js 22 or newer
- pnpm 10 or newer
- Git
- Docker (for the database and API)

### Install

```bash
pnpm install
```

### Configure

Copy `.env.example` to `.env` and fill in the required values, then start PostgreSQL:

```bash
pnpm db:up
pnpm db:migrate
```

### Run

```bash
pnpm dev
```

Individual apps:

```bash
pnpm dev:api       # API server
pnpm dev:web       # Web app
pnpm dev:desktop   # Desktop app
pnpm dev:cli       # CLI in watch mode
pnpm dev:ui        # Storybook component workbench
```

### Check

```bash
pnpm check         # format, lint, typecheck
pnpm test:run      # run all tests
pnpm deps:arch     # verify architecture boundaries
```

---

## Repository structure

CodeLane is a TypeScript monorepo with four apps and five shared packages.

```text
apps/
  api/        Express API, PostgreSQL, Drizzle ORM, Auth.js
  web/        Vite + React browser app
  desktop/    Electron desktop app (macOS, Windows, Linux)
  cli/        Commander CLI — the codelane command

packages/
  core/       Framework-agnostic domain types, Zod schemas, utilities
  config/     Shared ports, URLs, env parsing
  frontend/   Shared React routes and pages (used by web and desktop)
  ui/         Shared React UI components, Storybook, Tailwind 4
  api-client/ Typed API client helpers
```

Architecture boundaries are enforced automatically. Apps may not import from each other. Shared logic belongs in packages.

---

## Tech stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Language   | TypeScript 6                                                |
| Frontend   | React 19, React Router 7, Tailwind CSS 4                    |
| Components | shadcn/ui, Radix UI, Storybook                              |
| Desktop    | Electron 42, Electron Forge                                 |
| Backend    | Express 5                                                   |
| Database   | PostgreSQL 17, Drizzle ORM                                  |
| Auth       | Auth.js (web/desktop), PKCE OAuth flow (CLI)                |
| CLI        | Commander                                                   |
| Monorepo   | pnpm workspaces, Turborepo                                  |
| Tooling    | Oxlint, oxfmt, Knip, syncpack, dependency-cruiser, Lefthook |

---

## Documentation

| Document                                           | Purpose                                           |
| -------------------------------------------------- | ------------------------------------------------- |
| [CONTRIBUTING.md](./CONTRIBUTING.md)               | How to contribute, develop, and submit changes    |
| [SECURITY.md](./SECURITY.md)                       | How to report security vulnerabilities            |
| [docs/cli-auth.md](./docs/cli-auth.md)             | CLI authentication flow (PKCE, token lifecycle)   |
| [apps/api/README.md](./apps/api/README.md)         | API architecture and development guide            |
| [apps/web/README.md](./apps/web/README.md)         | Web app architecture and development guide        |
| [apps/desktop/README.md](./apps/desktop/README.md) | Desktop app architecture and development guide    |
| [apps/cli/README.md](./apps/cli/README.md)         | CLI architecture, commands, and development guide |

---

## License

CodeLane is licensed under the Apache License 2.0. See [LICENSE](./LICENSE) for details.
