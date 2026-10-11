#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export NEXT_TELEMETRY_DISABLED=1
export XDG_DATA_HOME="$PWD/.cache/data"
export XDG_CACHE_HOME="$PWD/.cache"
pnpm install --frozen-lockfile
node scripts/init-env.mjs
if node scripts/uses-local-database.mjs; then
  pnpm db:up
fi
pnpm db:generate
pnpm db:validate
pnpm db:migrate
pnpm db:seed
