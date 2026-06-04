# Docker and Dev Container Guide

This document explains how to run CodeLane in Docker — both for contributors working inside a dev container and for deploying the application stack.

---

## Contents

- [Dev container (recommended for contributors)](#dev-container-recommended-for-contributors)
- [Local development without Docker](#local-development-without-docker)
- [Production deployment with Docker Compose](#production-deployment-with-docker-compose)
- [Environment variables](#environment-variables)
- [Common commands](#common-commands)

---

## Dev container (recommended for contributors)

The `.devcontainer/` setup gives every contributor an identical, reproducible environment with no manual tooling installation.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed
- (Optional) [GitHub CLI](https://cli.github.com/) for authentication inside the container — the extension is pre-installed

### Getting started

1. Clone the repository and open it in VS Code.
2. When prompted, click **Reopen in Container** — or open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run **Dev Containers: Reopen in Container**.
3. VS Code builds the container and runs `post-create.sh` automatically, which:
   - Activates the correct pnpm version via Corepack
   - Installs all workspace dependencies
   - Creates `.env` from `.env.example` (with `DATABASE_URL` updated to use the container hostname)
   - Applies database migrations
4. Once the terminal shows _"Dev container ready."_, run `pnpm dev` to start the full development stack.

### What runs inside the container

| Service          | Host port | Purpose                                   |
| ---------------- | --------- | ----------------------------------------- |
| Vite (web)       | 3000      | Web app dev server                        |
| Express (api)    | 4000      | API server                                |
| Desktop renderer | 5173      | Electron renderer                         |
| PostgreSQL       | 5432      | Database (also reachable from host tools) |

All ports are forwarded to your local machine automatically.

### pnpm store cache

A named Docker volume (`pnpm-store`) persists the pnpm content-addressable store between container rebuilds. This means `pnpm install` is fast after the first run.

### Database migrations in the container

The `post-create.sh` script runs `pnpm db:migrate` on first setup. If you pull new migrations later, run:

```bash
pnpm db:migrate
```

---

## Local development without Docker

If you prefer not to use the dev container, you can run everything on your host machine.

### Prerequisites

- Node.js 22.12.0 or newer (`node --version`)
- pnpm 10 or newer (`pnpm --version`) — enable via `corepack enable && corepack install`
- Docker (only needed to run PostgreSQL)

### Setup

```bash
# Start the PostgreSQL database
pnpm db:up

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set AUTH_SECRET to a long random string:
#   openssl rand -base64 32

# Install dependencies
pnpm install

# Apply database migrations
pnpm db:migrate

# Start all dev servers
pnpm dev
```

---

## Production deployment with Docker Compose

`docker-compose.yaml` builds and runs the full production stack: PostgreSQL, the API, and the web app.

### Prerequisites

- Docker and Docker Compose

### Required environment variables

Copy `.env.example` to `.env` and set the mandatory values before starting:

```bash
cp .env.example .env
```

| Variable            | Required           | Description                                                                  |
| ------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `AUTH_SECRET`       | **Yes**            | Auth.js signing secret. Generate: `openssl rand -base64 32`                  |
| `VITE_API_BASE_URL` | **Yes**            | Public API URL baked into the web bundle at build time                       |
| `CORS_ORIGINS`      | **Yes**            | Comma-separated list of allowed browser origins                              |
| `DATABASE_URL`      | Auto-set           | Constructed from Postgres vars by Compose — override if using an external DB |
| `API_PORT`          | No (default: 4000) | Port the API listens on                                                      |
| `WEB_PORT`          | No (default: 3000) | Host port mapped to the web container's port 80                              |
| `POSTGRES_*`        | No (have defaults) | Database name, user, password, and port                                      |

### Start the stack

```bash
# Build images and start all services in the background
docker compose up -d --build

# Or start only the database (for local API development)
pnpm db:up
```

### Services

| Service    | Purpose                  | Dockerfile            |
| ---------- | ------------------------ | --------------------- |
| `postgres` | PostgreSQL 17 database   | official image        |
| `api`      | Express API server       | `apps/api/Dockerfile` |
| `web`      | Vite SPA served by nginx | `apps/web/Dockerfile` |

### Image details

**API** (`apps/api/Dockerfile`)

- Multi-stage: Node 22 Alpine build stage → Node 22 Alpine runner
- Production dependencies only in the final image
- Runs as a non-root `nodeuser`
- `HEALTHCHECK` polls `GET /health` every 30 s

**Web** (`apps/web/Dockerfile`)

- Multi-stage: Node 22 Alpine build stage → nginx 1.27 Alpine runner
- `VITE_API_BASE_URL` is passed as a build ARG and baked into the bundle
- nginx config handles SPA routing (all paths fall back to `index.html`)
- Static assets served with `Cache-Control: public, immutable` (1 year)

---

## Environment variables

See `.env.example` for the full list with descriptions. Key variables:

| Variable                         | Where it's used                                             |
| -------------------------------- | ----------------------------------------------------------- |
| `API_PORT`                       | API server port                                             |
| `WEB_PORT`                       | Host port for the web container                             |
| `VITE_API_BASE_URL`              | Browser-side API URL (baked into Vite bundle at build time) |
| `CODELANE_API_URL`               | API URL read by the CLI at runtime                          |
| `CODELANE_WEB_URL`               | Web URL read by the CLI at runtime                          |
| `CORS_ORIGINS`                   | Comma-separated allowed origins for the API                 |
| `AUTH_SECRET`                    | Auth.js signing secret                                      |
| `DATABASE_URL`                   | PostgreSQL connection string                                |
| `POSTGRES_DB/USER/PASSWORD/PORT` | Used by the Compose postgres service                        |

---

## Common commands

```bash
# Development
pnpm db:up                   # Start only PostgreSQL (for local dev)
pnpm dev                     # Start all dev servers
pnpm dev:api                 # Start the API only
pnpm dev:web                 # Start the web app only

# Docker Compose
docker compose up -d --build # Build and start the full production stack
docker compose up -d         # Start without rebuilding
docker compose down          # Stop all services (preserves volumes)
docker compose down -v       # Stop and delete all volumes (resets the database)
docker compose logs -f api   # Stream API logs
docker compose logs -f web   # Stream web logs

# Convenience aliases (from root package.json)
pnpm docker:up               # docker compose up -d
pnpm docker:down             # docker compose down
pnpm docker:build            # docker compose build
pnpm docker:logs:api         # docker compose logs -f api

# Database
pnpm db:generate             # Generate a new Drizzle migration from schema changes
pnpm db:migrate              # Apply pending migrations
pnpm db:studio               # Open Drizzle Studio (database browser)
```
