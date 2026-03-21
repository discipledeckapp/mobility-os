# API Control Plane

NestJS backend service providing all platform-governance APIs. Only accessible to platform staff roles.

## Responsibilities

Backend services for platform governance:
- Plans — plan catalog and feature matrix management
- Subscriptions — tenant subscription lifecycle and billing cycle state
- Billing — invoice generation, payment tracking, credit notes
- Platform wallets — SaaS consumption wallet operations (distinct from operational wallets)
- Metering — usage event ingestion and aggregation
- Support — ticket tracking and impersonation audit log
- Tenant lifecycle — lifecycle state machine and transitions
- Feature flags — per-tenant and global feature flag management
- Platform admin — internal admin APIs and dashboards

## Implementation Status

Currently implemented in this app:
- `plans`
- `subscriptions`
- `platform-settings`

Planned next modules within the existing control-plane boundary:
- `billing`
- `platform-wallets`
- `metering`
- `tenant-lifecycle`
- `feature-flags`
- `support`
- `platform-admin`

## Tech Stack

- Runtime: Node.js (NestJS)
- Database: PostgreSQL (schema prefix `cp_*`)
- ORM: Prisma
- Auth: JWT (platform staff roles only)

## Module Structure

```
src/
  auth/
  config/
  database/
  plans/
  platform-settings/
  subscriptions/

planned:
  billing/
  feature-flags/
  metering/
  platform-admin/
  platform-wallets/
  support/
  tenant-lifecycle/
```

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Run in development
pnpm --filter api-control-plane dev

# Run tests
pnpm --filter api-control-plane test
```

## Environment Variables

See `packages/env-config` for the full variable reference.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `PLATFORM_JWT_SECRET` — Platform JWT signing secret
- `INTERNAL_SERVICE_TOKEN` — Internal service-to-service token for protected control-plane internal routes
- `BOOTSTRAP_DEFAULT_PLATFORM_SETTINGS` — When `true`, seeds default structured platform settings on startup
- `PORT` — Default `3001`

## Controlled Bootstrap

The control plane can seed default structured settings through an explicit startup path.

Current default seed:
- key: `identity_verification_routing`
- default country payload: `NG`
- liveness providers: `amazon_rekognition` then `youverify` then `smile_identity`
- lookup providers: `youverify` then `smile_identity`
- fallback on provider error/unavailable: enabled
- fallback on no-match: disabled

This seed only runs when `BOOTSTRAP_DEFAULT_PLATFORM_SETTINGS=true`.

## Access Policy

This API must never be exposed to tenant users. All routes require `PLATFORM_ADMIN`, `SUPPORT_AGENT`, or `BILLING_OPS` role.

## Related Docs

- [Control Plane](../../docs/platform/control-plane.md)
- [ADR-004: Control Plane vs Tenant Plane](../../docs/decisions/ADR-004-control-plane-vs-tenant-plane.md)
