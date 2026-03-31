#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_CORE_E2E_DB_URL="${API_CORE_E2E_DB_URL:-postgresql://postgres:postgres@127.0.0.1:5432/mobility_os_e2e}"

cd "$ROOT_DIR"

echo ""
echo "[last-mile] Migrating clean api-core E2E database"
DATABASE_URL="$API_CORE_E2E_DB_URL" pnpm --filter @mobility-os/api-core db:migrate

echo ""
echo "[last-mile] Running api-intelligence provider and matching regression pack"
pnpm --filter @mobility-os/api-intelligence test -- --runInBand \
  src/providers/liveness.service.spec.ts \
  src/matching/matching.service.spec.ts \
  src/providers/identity-verification.service.spec.ts

echo ""
echo "[last-mile] Running api-control-plane payment regression pack"
pnpm --filter @mobility-os/api-control-plane test -- --runInBand src/payments/payments.service.spec.ts

echo ""
echo "[last-mile] Running api-core onboarding, assignment, and real self-service E2E pack"
pnpm --filter @mobility-os/api-core test -- --runInBand \
  src/drivers/driver-onboarding.spec.ts \
  src/drivers/drivers.service.spec.ts \
  src/assignments/assignments.service.spec.ts \
  test/driver-self-service-assignment.e2e-spec.ts

echo ""
echo "[last-mile] Running browser E2E for tenant-web and control-plane"
pnpm test:e2e:web

echo ""
echo "[last-mile] Running iOS native smoke harness"
pnpm --filter mobile-ops run test:e2e:ios-smoke

echo ""
echo "[last-mile] Running Android native smoke harness"
pnpm --filter mobile-ops run test:e2e:android-smoke

echo ""
echo "[last-mile] All checks passed"
