#!/bin/bash
set -euo pipefail

# Install Electron's native GUI dependencies (GTK, X11, NSS, etc.)
sudo apt-get update -qq
sudo apt-get install -y \
  libgtk-3-0 libglib2.0-0 libnss3 libnspr4 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 \
  libcairo2 libpango-1.0-0 libx11-6 libxcomposite1 \
  libxdamage1 libxext6 libxfixes3 libxrandr2 \
  libgbm1 libasound2 libxss1 libxtst6

# Activate the exact pnpm version declared in the root package.json
corepack enable
corepack install

# Point pnpm at the shared volume so reinstalls reuse cached packages
pnpm config set store-dir "${PNPM_STORE_DIR:-/pnpm-store}"

# Install all workspace dependencies
pnpm install

# Create .env from the example if one does not already exist.
# The dev container reaches PostgreSQL via the Docker Compose service name
# ("postgres"), so DATABASE_URL must use that hostname instead of localhost.
if [ ! -f .env ]; then
  cp .env.example .env
  sed -i 's|@localhost:|@postgres:|g' .env
  echo "Created .env from .env.example (DATABASE_URL updated to use Docker hostname 'postgres')"
fi

# Apply any pending database migrations
pnpm db:migrate

echo ""
echo "Dev container ready."
echo "Run 'pnpm dev:api' to start the API, 'pnpm dev:web' to start the web app,"
echo "or 'pnpm dev' to start everything at once."
