# Mobility OS — Claude Code Instructions

## Repo Purpose

Multi-tenant B2B SaaS platform for transport operators. Three planes:
- **Control plane** — platform governance (subscriptions, billing, feature flags, tenant lifecycle)
- **Tenant plane** — fleet operations (vehicles, drivers, remittance, accounting)
- **Intelligence plane** — canonical person graph, biometric uniqueness, cross-tenant risk signals

## Monorepo Structure

```
/
  apps/
    api-core/          NestJS — tenant operations API
    api-control-plane/ NestJS — platform governance API (staff-only)
    api-intelligence/  NestJS — person graph + identity resolution
    tenant-web/        Next.js — tenant-facing console
    control-plane-web/ Next.js — platform operator console (staff-only)
    mobile-ops/        React Native (Expo) — field operations app
  packages/            Shared TypeScript packages (canonical location)
    tenancy-domain/    TenantContext, TenantId, lifecycle types
    billing-domain/    Money, BillingCycle, invoice/subscription types
    intelligence-domain/ PersonId, RiskScore, IntelligenceQueryResult
    authz-model/       PlatformRole, TenantRole, Permission, guards
    env-config/        loadEnv(), typed env schemas
    domain-config/     country configs, document types, vehicle types
  docs/                Architecture docs and ADRs
```

## Key Architectural Rules

1. **api-control-plane** is only ever called by platform staff. Tenant users never touch it.
2. **Platform wallet** (`cp_*` schema) and **operational wallet** (`ow_*` schema) must never be co-mingled. See ADR-009.
3. **Cross-tenant intelligence** is surfaced as risk signals only — never raw records from other tenants.
4. **No country-specific logic in core code.** Nigeria (or any country) appears only as a config profile in `packages/domain-config/countries/`. Core domain code must be country-agnostic.
5. All DB schemas are prefixed by plane: `cp_*` (control plane), `ow_*` (operational wallets), `intel_*` (intelligence).
6. `packages/` is the canonical package location. `apps/packages/` is a legacy structure to be migrated.

## Tech Stack

| Layer | Stack |
|---|---|
| Backend APIs | NestJS 10, TypeScript 5, Prisma 5 |
| Frontend | Next.js 15 (App Router), Tailwind CSS |
| Mobile | React Native (Expo) |
| Database | PostgreSQL 16 (pgvector for intelligence) |
| Package manager | pnpm 9 |
| Build orchestration | Turborepo 2 |
| Lint / format | Biome 1.9 |
| Node | ≥ 20 |

## Common Commands

```bash
pnpm install              # install all workspace dependencies
pnpm dev                  # start all apps in dev mode
pnpm build                # build everything (respects turbo dependency order)
pnpm test                 # run all tests
pnpm check                # biome lint + format check
pnpm format               # auto-format all files
pnpm --filter api-core dev    # run a single app
```

## Decision Records

All architectural decisions are in `docs/decisions/`. Read before making structural changes.

Key ADRs:
- ADR-004 — why control plane and tenant plane are separate apps
- ADR-008 — why there is a global person graph
- ADR-009 — why platform and operational wallets are separate
- ADR-010 — the tenant → business entity → operating unit → fleet hierarchy
- ADR-011 — two environments only (prod + nonprod)
- ADR-012 — RPO/RTO targets

## What Claude Should Not Do

- Do not add country-specific logic to `api-core` or `api-control-plane` modules
- Do not let tenant-facing code import from control-plane modules
- Do not store biometric raw images — only embeddings
- Do not allow cross-tenant data access via the tenant API; use the intelligence API
- Do not use `any` in new code without a `// biome-ignore` comment and reason
