# Control Plane Web

Next.js platform operator console. Used exclusively by Mobility OS staff to manage all tenants, subscriptions, billing, and platform operations.

## Responsibilities

Platform operator console for managing:
- Tenants — view, create, suspend, and terminate tenant accounts
- Plans — manage the plan catalog and feature matrix
- Subscriptions — review and modify tenant subscriptions and billing terms
- Platform wallets — manage SaaS wallet balances and issue service credits
- Feature flags — enable/disable features per tenant, plan, country, or globally
- Support — handle support tickets, impersonation sessions, and audit log review
- Usage — view platform-wide and per-tenant usage dashboards
- Intelligence monitoring — review identity resolution queue, watchlists, and risk signals

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shared `packages/ui` and `packages/design-system`
- Auth: Platform bootstrap admin login / JWT (no tenant user access)

## Feature Structure

```
src/features/
  billing/
  dashboards/
  feature-flags/
  intelligence-monitoring/
  plans/
  platform-wallets/
  subscriptions/
  support/
  tenants/
  usage/
```

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Run in development
pnpm --filter control-plane-web dev

# Build
pnpm --filter control-plane-web build
```

## Environment Variables

Key variables:
- `NEXT_PUBLIC_CONTROL_PLANE_API_URL` — URL of `api-control-plane`
- `PLATFORM_TEST_ADMIN_EMAIL` — development-only seeded login helper email
- `PLATFORM_TEST_ADMIN_PASSWORD` — development-only seeded login helper password

For local testing, `api-control-plane` now persists a seeded bootstrap platform admin
from its env config on startup. `control-plane-web` can use those credentials directly:

- Email: `admin@mobiris.ng`
- Password: `AdminPass123!`

The login screen only surfaces these values automatically outside production.

## Access Policy

This application must not be accessible to tenant users. Deploy on an internal subdomain with IP allowlisting or VPN requirement.

## Related Docs

- [Control Plane](../../docs/platform/control-plane.md)
- [Support Operations](../../docs/platform/support-operations.md)
