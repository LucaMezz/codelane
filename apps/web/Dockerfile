FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy workspace manifests for layer caching — only packages the web app depends on
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/api-client/package.json ./packages/api-client/package.json

RUN pnpm install --frozen-lockfile

COPY . .

# VITE_API_BASE_URL is baked into the JS bundle at build time by Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm --filter @codelane/web build

# ---------------------------------------------------------------------------

FROM nginx:1.27-alpine AS runner

COPY --from=base /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
