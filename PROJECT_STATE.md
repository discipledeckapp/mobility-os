# Project State

Date: 2026-03-30
Status: Working snapshot

## Current Architecture

- `apps/api-core`
  - tenant operations plane
  - owns hierarchy, drivers, vehicles, assignments, remittance, readiness, notifications, privacy, policy, reports, operational wallets, tenant-billing orchestration, self-service, and mobile-ops APIs
- `apps/api-control-plane`
  - SaaS governance plane
  - owns plans, subscriptions, billing, payments, platform wallets, tenant lifecycle, metering, governance, provisioning, and staff operations
- `apps/api-intelligence`
  - canonical identity and risk plane
  - owns persons, identifiers, biometrics, matching, review cases, watchlists, linkage events, and risk
- `apps/tenant-web`
  - tenant operator web console
- `apps/mobile-ops`
  - mobile client for operator, driver, and guarantor role experiences
- `apps/control-plane-web`
  - platform staff console

## Current Reality

### Live and materially implemented

- tenant auth and protected sessions
- driver registry, verification, readiness, and self-service flows
- guarantor self-service and linkage workflows
- vehicle registry and valuation-aware detail flows
- assignment lifecycle
- remittance lifecycle
- business-entity and fleet surfaces
- reports and readiness views
- settings, team, notifications, and privacy request surfaces
- subscription and billing views for tenants
- mobile-ops role-aware app with operator, driver, and guarantor modes
- control-plane dashboards for subscriptions, billing operations, wallets, governance, operations, tenants, staff, and platform settings
- intelligence modules for matching, review cases, watchlists, and staff-side person/risk workflows

### Present but still incomplete or uneven

- operating-unit workflow depth
- maintenance work-order UX completeness
- inspection workflow completeness
- document operations as a coherent product surface
- audit visibility as a user-facing workflow
- usage and metering visibility in control-plane web
- support/ticketing/impersonation operational tooling
- mobile parity for all operator-critical workflows

## Known Drift

- some docs understate how much now exists
- some docs still describe `/wallet` as an operational-wallet page, while tenant-web currently uses it for verification funding
- mobile-first intent is accepted in architecture but not yet fully complete in execution
- `tenant-web` feature-folder structure does not reflect where most real implementation currently lives

## Current Priorities

1. recover and lock one canonical product/system truth
2. stabilize role-aware access and routing across operator, driver, and guarantor experiences
3. clarify wallet / verification funding / SaaS billing semantics
4. complete mission-critical operator workflows
5. align mobile-ops with the real mobile-first operator strategy

## Reference Docs

- [Product Intent Recovery Implementation Plan](/Users/seyiadelaju/mobility-os/docs/engineering/product-intent-recovery-implementation-plan.md)
- [Canonical Ownership Matrix](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)
- [Phase 1-2 Execution Backlog](/Users/seyiadelaju/mobility-os/docs/engineering/phase-1-2-execution-backlog.md)
