# Application Map

## Runtime Surfaces

- `apps/api-core`
  - tenant operations plane
  - owns drivers, vehicles, assignments, remittance, and operational wallets
  - owns driver guarantor records used for operator onboarding and activation gating
  - owns driver document lifecycle state, storage-backed previews, licence approval, and aggregated readiness checks
  - owns the local vehicle maker/model catalog used by tenant runtime flows
  - uses NHTSA vPIC only for catalog bootstrap and VIN decode enrichment
- `apps/api-control-plane`
  - SaaS governance plane
  - owns plans, subscriptions, billing, platform wallets, metering, and tenant lifecycle
- `apps/api-intelligence`
  - canonical identity and verification plane
  - owns liveness, identity resolution, risk, and person graph workflows
- `apps/tenant-web`
  - tenant operator console
  - now includes live pages for dashboard, drivers, vehicles, assignments, remittance, and a read-only wallet page
- `apps/mobile-ops`
  - Expo mobile client for tenant field operations
  - uses tenant JWT auth against `apps/api-core`
  - supports assignment review, remittance capture, and driver verification visibility

## Wallet Placement

- Operational wallet APIs live in `apps/api-core`
- SaaS billing wallets live in `apps/api-control-plane`
- `apps/tenant-web` only reads the operational wallet through tenant-scoped APIs
- No wallet behavior has been moved into `apps/api-intelligence`

## Current Alignment

- Plane separation is still intact
- Wallet separation is still intact
- Tenant-web wallet reads business-entity-scoped operational wallet data only
- Vehicle catalog runtime reads stay local to `apps/api-core`; vPIC is not a tenant-web runtime dependency
