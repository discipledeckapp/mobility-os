#!/bin/bash
# Safe migration script for production deployments.
#
# Default behaviour is strict:
#   1. Run `prisma migrate deploy`.
#   2. If it fails, stop the deployment and surface the error.
#
# Optional one-time recovery path:
#   - Set ALLOW_MIGRATION_BASELINE=true to explicitly baseline existing
#     migrations after a failed deploy, then retry deploy.
#
# This avoids silently marking migrations as applied on unrelated failures,
# which can leave production in a partially migrated state.

set -e

SCHEMA="src/database/prisma/schema.prisma"
MIGRATION_DIR="src/database/prisma/migrations"
ALLOW_BASELINE="${ALLOW_MIGRATION_BASELINE:-false}"
MIGRATION_DATABASE_URL="${MIGRATION_DATABASE_URL:-${DIRECT_DATABASE_URL:-}}"

if [ -n "$MIGRATION_DATABASE_URL" ]; then
  echo "[migrate-safe] Using direct migration database URL from MIGRATION_DATABASE_URL/DIRECT_DATABASE_URL."
fi

run_deploy() {
  if [ -n "$MIGRATION_DATABASE_URL" ]; then
    DATABASE_URL="$MIGRATION_DATABASE_URL" pnpm exec prisma migrate deploy --schema "$SCHEMA"
  else
    pnpm exec prisma migrate deploy --schema "$SCHEMA"
  fi
}

echo "[migrate-safe] Running prisma migrate deploy..."

if run_deploy; then
  echo "[migrate-safe] Migrations applied successfully."
  exit 0
fi

if [ "$ALLOW_BASELINE" != "true" ]; then
  echo "[migrate-safe] Migration deploy failed."
  echo "[migrate-safe] Automatic baselining is disabled by default."
  echo "[migrate-safe] If this database is a known legacy environment that needs a one-time baseline,"
  echo "[migrate-safe] rerun with ALLOW_MIGRATION_BASELINE=true after verifying the schema state."
  exit 1
fi

echo "[migrate-safe] Deploy failed - ALLOW_MIGRATION_BASELINE=true, attempting explicit baseline..."

for migration_dir in "$MIGRATION_DIR"/*/; do
  migration_name=$(basename "$migration_dir")
  echo "[migrate-safe] Marking as applied: $migration_name"
  if [ -n "$MIGRATION_DATABASE_URL" ]; then
    DATABASE_URL="$MIGRATION_DATABASE_URL" pnpm exec prisma migrate resolve --applied "$migration_name" --schema "$SCHEMA" 2>/dev/null || true
  else
    pnpm exec prisma migrate resolve --applied "$migration_name" --schema "$SCHEMA" 2>/dev/null || true
  fi
done

echo "[migrate-safe] Retrying prisma migrate deploy after baseline..."
run_deploy
echo "[migrate-safe] Done."
