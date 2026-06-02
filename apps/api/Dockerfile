FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy workspace metadata first for better Docker layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json

# If api depends on shared packages later, copy their package.json files too
COPY packages/config/package.json ./packages/config/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build only the API and its dependencies
RUN pnpm --filter @appkit/api build

FROM node:22-alpine AS runner

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/core/package.json ./packages/core/package.json

RUN pnpm install --prod --frozen-lockfile --filter @appkit/api

COPY --from=base /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

ARG API_PORT=4000
ENV API_PORT=$API_PORT
ENV PORT=$API_PORT

EXPOSE $API_PORT

CMD ["node", "dist/server.js"]
