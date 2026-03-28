# Tenant Web

Next.js tenant-facing operational console. The primary web interface for transport operators to manage their day-to-day fleet operations.

## Responsibilities

Tenant-facing operational console for:
- Business entities — manage legal/commercial entities under the tenant account
- Operating units — manage branches and depot locations
- Fleets — group and configure vehicle fleets
- Vehicles — full vehicle lifecycle (onboarding, documents, status, valuation, maintenance)
- Drivers — driver onboarding, document management, assignment history, risk signals
- Assignments — driver-vehicle assignment management
- Remittance — configure remittance rules and process daily collections
- Maintenance — maintenance scheduling and history
- Valuations — vehicle valuation records
- Accounting — financial reports and journal entries
- Operational wallets — cash position, ledger view, and wallet transactions
- Audit — audit log viewer for all tenant operations
- Documents — document uploads and compliance tracking
- Investors — investor and financing records

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shared `packages/ui` and `packages/design-system`
- Auth: Tenant user JWT (scoped to tenant + business entity + operating unit)

## Feature Structure

```
src/features/
  accounting/
  assignments/
  audit/
  businesses/
  dashboard/
  documents/
  drivers/
  fleets/
  inspections/
  investors/
  maintenance/
  operating-units/
  operational-wallets/
  remittance/
  settings/
  valuations/
  vehicles/
```

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Run in development
pnpm --filter tenant-web dev

# Build
pnpm --filter tenant-web build
```

## Environment Variables

Key variables:
- `NEXT_PUBLIC_API_URL` — URL of `api-core`
- `NEXT_PUBLIC_YOUVERIFY_SANDBOX` — set to `true` when tenant-web should initialize the YouVerify web SDK in sandbox mode
- `NODE_ENV` — set by Vercel automatically

For production, point `NEXT_PUBLIC_API_URL` at the deployed `api-core` base URL, e.g.
`https://mobility-os-api-core.onrender.com/api/v1`.

If you are running a production deployment against YouVerify sandbox credentials for a pilot,
set `NEXT_PUBLIC_YOUVERIFY_SANDBOX=true`. Do not rely on `NODE_ENV` to infer sandbox mode.

## Related Docs

- [Tenant Lifecycle](../../docs/platform/tenant-lifecycle.md)
- [ADR-010: Tenant Business Hierarchy](../../docs/decisions/ADR-010-tenant-business-hierarchy.md)
