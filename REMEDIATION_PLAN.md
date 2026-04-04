# Repository Remediation Plan

Date: 2026-04-04
Status: Executed
Scope: Mobility OS / Mobiris monorepo

## Purpose

This plan converts the repo review into a safe execution sequence that closes real gaps without collapsing plane boundaries or introducing architectural shortcuts.

Execution order follows the mandated priority:

1. Planning
2. Test coverage
3. Accounting
4. Remittance tenant-web completion
5. Prisma cast cleanup
6. Intelligence UI
7. Verification billing ADR

## Severity Scale

- High: incorrect behavior, weak reliability, or missing product-critical capability
- Medium: important product gap or maintainability risk, but not the first source of production instability
- Low: strategically important, but safe to defer behind correctness and workflow completion

## Risk Scale

- Low: additive documentation or isolated surface work
- Medium: domain-local logic or UI expansion with bounded integration risk
- High: stateful financial, onboarding, or cross-service changes with regression potential

## Issue Register

| ID | Issue | Severity | Scope | Dependencies | Risk | Notes |
|---|---|---|---|---|---|---|
| R1 | Thin test coverage relative to repo size; critical service and UI flows under-tested | High | `apps/api-core`, `apps/tenant-web`, `apps/mobile-ops`, `apps/control-plane-web`, `packages/*` | None | High | Must come first because later changes touch money, onboarding, readiness, and tenancy boundaries |
| R2 | Onboarding / payment / guarantor / verification flows have duplicated or stale gating logic risk | High | `apps/api-core`, `apps/tenant-web`, `apps/mobile-ops`, `packages/*domain*` | R1 | High | Observed in recent regressions; requires source-of-truth audit plus integration tests |
| R3 | Accounting is not a real first-class feature in `api-core`; tenant-web accounting surface is missing | High | `apps/api-core`, `apps/tenant-web`, `packages/authz-model`, Prisma schema/migrations | R1 | High | Must remain separate from wallets, remittance, and tenant billing domains |
| R4 | Tenant-web remittance gap versus product intent / mobile parity | Medium | `apps/tenant-web`, `apps/api-core` | R1 | Medium | Existing remittance route exists; plan should close parity gaps instead of rebuilding from scratch |
| R5 | Unsafe Prisma delegate casts in `drivers.service.ts` and related narrow `as never` patterns | Medium | `apps/api-core` | R1 | Medium | Known maintenance hazard and silent breakage risk |
| R6 | Intelligence backend is ahead of its staff UI surfaces; no complete review/risk/watchlist workbench in control-plane-web | Low | `apps/control-plane-web`, `apps/api-intelligence`, possibly `apps/api-control-plane` passthroughs if needed | R1 | Medium | Must preserve platform-only visibility and cross-tenant secrecy constraints |
| R7 | Verification billing model lacks an ADR covering entitlements, metering, and control-plane responsibilities | Low | `docs/`, `apps/api-core`, `apps/api-control-plane`, `apps/api-intelligence` | R2, R3 | Low | Documentation task, but should reflect implemented contracts rather than aspiration |
| R8 | Tenancy guards (`assertTenantOwnership`, `assertFleetAccess`) and billing/metering contracts are not explicitly regression-protected enough | High | `packages/tenancy-domain`, `apps/api-core`, `apps/api-control-plane` | R1 | High | Should be addressed as part of test expansion before domain expansion |
| R9 | Mobile operator and self-service flows lag behind current web-side fixes and need parity validation | Medium | `apps/mobile-ops`, `apps/api-core` | R1, R2 | Medium | Important for mobile-first delivery, but should follow core test safety net |

## Execution Order

### Phase 0: Planning Baseline

Objective:
- establish a single, review-backed execution map before code changes

Deliverables:
- `REMEDIATION_PLAN.md`
- `TEST_COVERAGE_PLAN.md`

Why first:
- the requested work spans all three planes and multiple apps
- sequencing errors would create avoidable regressions

### Phase 1: Test Coverage And Regression Prevention

Objective:
- create a protective test net around the highest-risk operational flows before expanding domain scope

Includes:
- driver onboarding integration tests
- guarantor onboarding integration tests
- payment -> onboarding -> verification chain tests
- remittance service integration tests
- tenancy access/ownership tests
- billing and metering interaction tests
- thin but meaningful critical UI flow tests for tenant-web and mobile-ops

Primary risks:
- current behavior is spread across services and web clients
- recent regressions show stale logic can reappear unless flows are tested end-to-end

Definition of done:
- critical readiness, funding, guarantor, and remittance transitions are covered by behavior-focused tests

### Phase 2: Accounting Feature Completion

Objective:
- turn accounting from a placeholder concept into a real tenant-plane domain

Includes:
- new `accounting` module in `api-core`
- ledger entries endpoint
- balance summary endpoint
- basic P&L endpoint
- integration hooks from operational wallets, remittance, and billing-originating business events
- tenant-web accounting screens

Constraints:
- accounting must not be mixed into `remittance`, `operational-wallets`, or `tenant-billing`
- control-plane SaaS billing and tenant operational accounting must remain separate

Definition of done:
- tenant operator can inspect ledger, balances, and basic P&L without using billing or wallet views as proxies

### Phase 3: Tenant-Web Remittance Completion

Objective:
- close product and parity gaps in tenant remittance operations without duplicating backend logic

Includes:
- remittance recording UX audit and gap closure
- remittance history improvements
- overdue tracking surfaces
- parity review against `mobile-ops`

Constraints:
- reuse `api-core` remittance services
- do not fork business rules across web and mobile

Definition of done:
- tenant-web supports the same current remittance operating model as mobile-ops for the intended operator role

### Phase 4: Prisma Cast Cleanup

Objective:
- remove unsafe delegate casting in `drivers.service.ts` and related narrow Prisma write paths

Includes:
- replace `as never` / synthetic delegate shapes with typed Prisma access or mapping helpers
- validate compatibility against current generated client

Definition of done:
- no narrow delegate TODO remains in `drivers.service.ts`
- affected writes compile without unsafe cast chains

### Phase 5: Intelligence UI Completion

Objective:
- expose the existing intelligence backend to platform staff in a safe, role-bound way

Includes:
- review cases surface completion
- flagged persons / watchlist surface
- risk signals surface

Constraints:
- no cross-tenant raw data leakage into tenant-facing apps
- enforce platform-role authorization

Definition of done:
- control-plane staff can review cases and risk/watchlist signals from dedicated routes

### Phase 6: Verification Billing ADR

Objective:
- document the verification billing model now that multiple services participate in it

Includes:
- entitlements vs metering
- control-plane ownership
- api-core orchestration responsibility
- sequence diagrams

Definition of done:
- engineering can explain and extend verification billing without reintroducing duplicate gating logic

## Dependencies

| From | To | Why |
|---|---|---|
| R1 | R2 | source-of-truth bugs need regression tests before more flow changes |
| R1 | R3 | accounting touches money, persistence, and UI; it needs a safety net first |
| R1 | R4 | remittance parity changes should be protected by integration tests |
| R1 | R5 | cast cleanup is safer once current behaviors are pinned down |
| R2 | R7 | the billing ADR should describe the stabilized flow, not the buggy one |
| R3 | R4 | tenant-web finance surfaces should not accidentally overlap accounting/remittance responsibilities |

## Detailed Work Packages

### WP-1 Test Coverage Expansion

Primary apps/services:
- `apps/api-core/src/drivers`
- `apps/api-core/src/remittance`
- `apps/api-core/src/tenant-billing`
- `apps/api-core/src/auth`
- `apps/tenant-web`
- `apps/mobile-ops`
- `packages/tenancy-domain`

Risk:
- High

Main outputs:
- new service-layer integration tests
- critical UI flow tests
- source-of-truth flow matrix for onboarding and readiness

### WP-2 Accounting Domain Introduction

Primary apps/services:
- `apps/api-core/src/accounting/*` (new)
- `apps/api-core/src/operational-wallets`
- `apps/api-core/src/remittance`
- `apps/api-core/src/tenant-billing`
- `apps/tenant-web/src/app/accounting/*` (new)

Risk:
- High

Main outputs:
- accounting module
- endpoints
- tenant-web views

### WP-3 Tenant-Web Remittance Completion

Primary apps/services:
- `apps/tenant-web/src/app/remittance/*`
- `apps/mobile-ops/src/features/remittance/*`
- `apps/api-core/src/remittance/*`

Risk:
- Medium

Main outputs:
- parity matrix
- completed tenant-web remittance flow

### WP-4 Prisma Type Safety Cleanup

Primary apps/services:
- `apps/api-core/src/drivers/drivers.service.ts`
- any supporting typed helper files introduced

Risk:
- Medium

Main outputs:
- unsafe delegate casts removed
- compiler-checked write shapes

### WP-5 Intelligence Staff UI

Primary apps/services:
- `apps/control-plane-web/src/app/intelligence/*` (new)
- `apps/api-intelligence/src/review-cases/*`
- `apps/api-intelligence/src/risk/*`
- `apps/api-intelligence/src/watchlists/*`

Risk:
- Medium

Main outputs:
- new control-plane routes
- staff-only intelligence views

### WP-6 ADR Completion

Primary apps/services:
- `docs/adr/verification-billing.md` (new)
- implementation references in `api-core`, `api-control-plane`, `api-intelligence`

Risk:
- Low

Main outputs:
- architectural decision record with sequence diagrams and rationale

## Known Constraints

- The monorepo is already production-grade; broad rewrites are out of scope.
- Plane separation must remain intact:
  - tenant operations plane
  - control plane
  - intelligence plane
- Existing remittance and intelligence work should be deepened, not rebuilt from scratch.
- Recent onboarding regressions show that duplicated gating logic is a recurring failure mode; changes in these areas require integration tests.

## Immediate Next Step

Create and execute `TEST_COVERAGE_PLAN.md`, then implement the test work before touching accounting, remittance expansion, Prisma cleanup, or intelligence UI.

## Execution Result

Completed work packages:

- WP-1 Test Coverage Expansion
- WP-2 Accounting Domain Introduction
- WP-3 Tenant-Web Remittance Completion
- WP-4 Prisma Type Safety Cleanup
- WP-5 Intelligence Staff UI
- WP-6 ADR Completion

Implemented module and surface additions:

- `apps/api-core/src/accounting/*`
- `apps/tenant-web/src/app/accounting/page.tsx`
- `apps/control-plane-web/src/app/intelligence/*`
- `docs/adr/verification-billing.md`

Implementation notes:

- accounting was added as a separate tenant-plane domain and not folded into wallets, remittance, or control-plane billing
- tenant-web remittance work closed parity gaps on overdue/outstanding visibility rather than rebuilding the feature
- Prisma cleanup removed the risky `as never` call-site pattern from `drivers.service.ts`
- intelligence UI stayed platform-only in `control-plane-web`
