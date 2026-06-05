FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy workspace manifests for layer caching — only packages the API depends on
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/core/package.json ./packages/core/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @codelane/api build

# ---------------------------------------------------------------------------

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/core/package.json ./packages/core/package.json

# Install production dependencies only (includes native modules such as argon2)
RUN pnpm install --prod --frozen-lockfile --filter @codelane/api

COPY --from=base /app/apps/api/dist ./apps/api/dist

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nodeuser \
  && chown -R nodeuser:nodejs /app

USER nodeuser
WORKDIR /app/apps/api

ARG API_PORT=4000
ENV API_PORT=$API_PORT

EXPOSE $API_PORT

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://localhost:${API_PORT}/health" || exit 1

CMD ["node", "dist/server.js"]
