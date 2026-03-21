# Control Plane

## Purpose

The control plane is the platform-operator side of Mobility OS. It provides the tooling, APIs, and dashboards that Mobility OS staff use to manage all tenants, subscriptions, and platform-level operations — completely separate from any tenant's own operational data.

## Responsibilities

| Area | Description |
|---|---|
| Tenant onboarding & lifecycle | Create, activate, suspend, and terminate tenant accounts |
| Plan assignment | Assign and change subscription plans |
| Subscription control | Manage billing cycles, seat limits, and feature entitlements |
| Wallet & billing oversight | Manage platform wallets, credit adjustments, and invoicing |
| Usage monitoring | Aggregate and review metered usage across all tenants |
| Support operations | Handle escalations, impersonation for debugging, SLA tracking |
| Feature flag management | Enable or disable features per tenant or globally |
| Country rollout controls | Gate feature availability by geography |
| Verification routing governance | Define which liveness and lookup providers are allowed per country, in what order, and with what fallback policy |
| Platform admin visibility | Dashboards showing platform-wide health, revenue, and risk |

## Architecture Boundary

The control plane runs as a dedicated application (`apps/api-control-plane`) with its own schema prefix (`cp_*`) in the shared database. It does **not** share module code with the tenant data plane (`apps/api-core`).

See [ADR-004](../decisions/ADR-004-control-plane-vs-tenant-plane.md) for the rationale.

## Key Modules

Implemented now:
- `plans` — plan catalog and feature matrix
- `subscriptions` — tenant subscription records and billing cycle state

Planned within the control-plane boundary:
- `billing` — invoice generation, payment tracking, credit notes
- `platform-wallets` — SaaS consumption wallets (distinct from operational wallets)
- `metering` — usage event ingestion and aggregation
- `tenant-lifecycle` — lifecycle state machine and event log
- `feature-flags` — per-tenant and global feature flags
- `platform-settings` — structured platform-admin configuration for provider routing, country rollout policy, and other non-boolean controls
- `support` — support ticket tracking and impersonation audit log
- `platform-admin` — internal admin APIs

## Structured Config Boundary

Provider routing is not a feature-flag concern.

Liveness vendor selection, lookup provider priority, fallback rules, and country-specific verification policy are structured control-plane configuration and should eventually live in a dedicated platform-admin/settings surface. They should not be modeled as booleans in feature flags and should not be hardcoded inside intelligence matching logic.

Expected ownership split:
- control plane defines and governs structured admin configuration
- intelligence plane consumes that configuration and executes liveness, lookup, enrichment, and review workflows
- tenant operations plane remains unaware of provider-routing internals

Validation rule:
- control-plane settings must be validated against the country capability matrix so unsupported provider/country combinations cannot be saved as admin config

## Controlled Bootstrap

Default structured settings may be seeded through a controlled control-plane bootstrap path, not through intelligence startup and not through database migration side effects.

Current bootstrap control:
- `BOOTSTRAP_DEFAULT_PLATFORM_SETTINGS=true`

Current seeded default:
- `identity_verification_routing`
  - country: `NG`
  - liveness providers: `amazon_rekognition` → `youverify` → `smile_identity`
  - lookup primary: `youverify`
  - lookup fallback: `smile_identity`
  - fallback on provider error: `true`
  - fallback on provider unavailable: `true`
  - fallback on no-match: `false`

This keeps default routing policy under control-plane ownership while still allowing platform-admin overrides after bootstrap.

## Access Control

Control-plane APIs are only accessible to platform staff roles (`PLATFORM_ADMIN`, `SUPPORT_AGENT`, `BILLING_OPS`). Tenant users never interact with these endpoints directly.

## Related Docs

- [Subscription & Billing](./subscription-and-billing.md)
- [Tenant Lifecycle](./tenant-lifecycle.md)
- [Feature Flag Strategy](./feature-flag-strategy.md)
- [Usage Metering](./usage-metering.md)
- [Support Operations](./support-operations.md)
- [ADR-004](../decisions/ADR-004-control-plane-vs-tenant-plane.md)
