#!/bin/bash
set -euo pipefail

# Install Electron's runtime dependencies. The desktop-lite feature provides
# the core X11/Wayland stack; these cover the Chromium-specific libs that
# desktop environments typically don't install.
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
  libgtk-3-0 libglib2.0-0 libnss3 libnspr4 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 \
  libcairo2 libpango-1.0-0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2 libxss1 libxtst6

# Install the similarity-ts binary used by the pre-push Lefthook hook.
# The Rust feature installs cargo to /usr/local/cargo/bin.
export PATH="/usr/local/cargo/bin:$PATH"
cargo install similarity-ts

# Activate the exact pnpm version declared in the root package.json
corepack enable
corepack install

# Point pnpm at the shared volume so reinstalls reuse cached packages
pnpm config set store-dir "${PNPM_STORE_DIR:-/pnpm-store}"

# Install all workspace dependencies
pnpm install

# Create .env from the example if one does not already exist.
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# The dev container reaches PostgreSQL via the Docker Compose service name
# ("postgres"), not "localhost". Run unconditionally so rebuilds don't leave
# a stale localhost URL from a previously persisted .env file.
sed -i 's|@localhost:|@postgres:|g' .env
echo "DATABASE_URL hostname ensured to use Docker service name 'postgres'"

# Apply any pending database migrations
echo "Running database migrations..."
pnpm db:migrate && echo "Migrations applied." || {
  echo "ERROR: database migrations failed. Check that the 'postgres' service is healthy and DATABASE_URL is correct."
  echo "Current DATABASE_URL: $(grep DATABASE_URL .env)"
  exit 1
}

echo ""
echo "Dev container ready."
echo "Run 'pnpm dev:api' to start the API, 'pnpm dev:web' to start the web app,"
echo "or 'pnpm dev' to start everything at once."
echo "To test the Electron app, run 'pnpm dev:desktop' and open http://localhost:6080"
