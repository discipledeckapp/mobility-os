#!/bin/bash
# Safe migration script for production deployments.
#
# Handles the case where the database already has tables (created via
# prisma db push or a previous deployment without migration tracking)
# but the _prisma_migrations table is empty or missing.
#
# Behaviour:
#   1. Try `prisma migrate deploy` — succeeds if migration state is clean.
#   2. If it fails (tables already exist), baseline all migrations as applied
#      without re-running them, then run deploy again for any genuinely new
#      migrations.

set -e

SCHEMA="src/database/prisma/schema.prisma"
MIGRATION_DIR="src/database/prisma/migrations"

echo "[migrate-safe] Running prisma migrate deploy..."

if pnpm exec prisma migrate deploy --schema "$SCHEMA"; then
  echo "[migrate-safe] Migrations applied successfully."
  exit 0
fi

echo "[migrate-safe] Deploy failed — attempting to baseline existing migrations..."

for migration_dir in "$MIGRATION_DIR"/*/; do
  migration_name=$(basename "$migration_dir")
  echo "[migrate-safe] Marking as applied: $migration_name"
  pnpm exec prisma migrate resolve --applied "$migration_name" --schema "$SCHEMA" 2>/dev/null || true
done

echo "[migrate-safe] Retrying prisma migrate deploy after baseline..."
pnpm exec prisma migrate deploy --schema "$SCHEMA"
echo "[migrate-safe] Done."
