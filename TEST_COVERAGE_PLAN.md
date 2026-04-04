# Test Coverage Plan

Date: 2026-04-04
Status: Executed
Scope: Mobility OS / Mobiris monorepo

## Baseline

Current observed file counts across `apps/` and `packages/`:

- Source files: 1,199
- Test files: 35
- Rough test-file ratio: 2.9%

Current notable gaps:

- `apps/tenant-web`: no automated test coverage
- `apps/control-plane-web`: no automated test coverage
- `apps/mobile-ops`: no automated test coverage
- domain packages such as `packages/tenancy-domain` and `packages/authz-model`: no direct test coverage

## Coverage Strategy

This plan prioritizes behavior-protecting tests over shallow unit tests.

Test pyramid for this remediation:

1. Service-layer integration tests first
2. Guard / policy / state-machine tests second
3. Thin UI flow tests for critical operator and self-service screens third

## Priority Coverage Targets

### 1. Driver + Guarantor Onboarding Chain

Risk:
- High

Why:
- recent regressions involved payment gating, stale state, guarantor requirements, readiness messaging, and verification step sequencing

Add tests for:
- driver pays -> onboarding progresses -> document verification does not reopen funding gate
- organisation-paid flow -> document verification trusts resolved payment state
- guarantor required by policy -> driver remains not-ready until guarantor verified
- guarantor pending -> UI shows pending/almost-ready, not ready
- guarantor verified -> readiness flips consistently across contexts
- driver self-service token / guarantor self-service token continuation flows

Planned files:
- `apps/api-core/src/drivers/drivers.service.integration.spec.ts`
- `apps/api-core/src/drivers/driver-readiness.integration.spec.ts`
- `apps/api-core/src/drivers/guarantor-self-service.integration.spec.ts`
- `apps/tenant-web/src/app/driver-self-service/page.spec.tsx`
- `apps/tenant-web/src/app/guarantor-self-service/page.spec.tsx`

### 2. Payment -> Onboarding -> Verification Chain

Risk:
- High

Why:
- cross-service orchestration between tenant-web, api-core, billing clients, and provider flows is a proven regression hotspot

Add tests for:
- payment required -> checkout initialized correctly
- payment success / org funding resolved -> verification step unlocked
- failed payment -> user remains blocked before progression
- page reload after payment -> state remains resolved
- provider verification failure shows provider/document error, not stale billing error

Planned files:
- `apps/api-core/src/tenant-billing/driver-kyc-checkout.integration.spec.ts`
- `apps/api-core/src/drivers/payment-verification-chain.integration.spec.ts`

### 3. Remittance Flow Coverage

Risk:
- High

Why:
- remittance is a mission-critical operator workflow and should be protected before tenant-web parity work expands it

Add tests for:
- record remittance
- list/history by assignment and tenant
- overdue status derivation
- approval / rejection paths if applicable
- remittance impact on reports / readiness summaries where applicable

Planned files:
- `apps/api-core/src/remittance/remittance.integration.spec.ts`
- `apps/api-core/src/remittance/remittance-overdue.integration.spec.ts`
- `apps/tenant-web/src/app/remittance/page.spec.tsx`
- `apps/mobile-ops/src/features/remittance/screens/RemittanceScreen.spec.tsx`

### 4. Tenancy Guard Coverage

Risk:
- High

Why:
- guard failures are silent security regressions if not pinned down

Add tests for:
- `assertTenantOwnership`
- `assertFleetAccess`
- access denial on cross-tenant/cross-fleet resources
- valid access paths for authorized tenant contexts

Planned files:
- `packages/tenancy-domain/src/index.spec.ts`
- `apps/api-core/src/auth/tenant-access.spec.ts`

### 5. Billing / Metering Interaction Coverage

Risk:
- High

Why:
- verification funding, metering, entitlements, and internal auth are spread across multiple services

Add tests for:
- metering event emission on eligible workflows
- billing client failure translation
- entitlement preservation during downstream verification failures
- no duplicate spend application for a single funded verification path

Planned files:
- `apps/api-core/src/tenant-billing/verification-spend.integration.spec.ts`
- `apps/api-core/src/tenant-billing/control-plane-billing.client.spec.ts`
- `apps/api-core/src/tenant-billing/control-plane-metering.client.spec.ts`

### 6. Tenant-Web Critical Flow Coverage

Risk:
- Medium

Why:
- tenant-web currently has no automated tests despite holding critical assignment, remittance, and driver creation flows

Add tests for:
- driver creation happy path and validation failure
- assignment creation key path
- driver readiness summary rendering
- remittance summary rendering

Planned files:
- `apps/tenant-web/src/app/drivers/create-driver-form.spec.tsx`
- `apps/tenant-web/src/app/assignments/create-assignment-form.spec.tsx`

### 7. Mobile-Ops Critical Flow Coverage

Risk:
- Medium

Why:
- mobile-first execution is an architectural goal, but mobile-ops currently has no tests

Add tests for:
- operator remittance flow rendering / submission
- driver or guarantor onboarding continuation flow
- loading / error / processing state transitions for the main self-service flows

Planned files:
- `apps/mobile-ops/src/features/remittance/screens/RemittanceHistoryScreen.spec.tsx`
- `apps/mobile-ops/src/features/drivers/screens/ProfileScreen.spec.tsx`
- `apps/mobile-ops/src/services/remittance-service.spec.ts`

## Expected Coverage Outcome

Baseline:

- 35 test files
- 0 test files in `tenant-web`
- 0 test files in `control-plane-web`
- 0 test files in `mobile-ops`
- 0 direct package tests for tenancy/domain guard logic

Planned minimum after this remediation phase:

- 50+ test files total
- service integration coverage added for drivers, remittance, tenant billing, and onboarding chains
- first critical tests in tenant-web and mobile-ops
- first direct tests in `packages/tenancy-domain`

This is not full statistical coverage.
It is a targeted increase in regression resistance around correctness-critical flows.

## Actual Outcome

Observed after execution:

- Test files: 50
- Net increase: +15 test files from the original 35-file baseline
- `apps/tenant-web`: first automated coverage added
- `apps/control-plane-web`: first automated coverage added
- `apps/mobile-ops`: first automated coverage added
- `packages/tenancy-domain`: direct domain/tenancy coverage added

Added test files:

- `apps/api-core/src/auth/tenant-access.spec.ts`
- `apps/api-core/src/tenant-billing/control-plane-billing.client.spec.ts`
- `apps/api-core/src/tenant-billing/control-plane-metering.client.spec.ts`
- `apps/api-core/src/accounting/accounting.service.spec.ts`
- `apps/api-core/src/drivers/driver-onboarding.spec.ts`
- `packages/tenancy-domain/src/index.spec.ts`
- `apps/tenant-web/src/app/drivers/action-helpers.spec.ts`
- `apps/tenant-web/src/app/assignments/action-helpers.spec.ts`
- `apps/tenant-web/src/app/remittance/view-helpers.spec.ts`
- `apps/tenant-web/src/app/accounting/view-helpers.spec.ts`
- `apps/tenant-web/src/lib/assignment-display.spec.ts`
- `apps/control-plane-web/src/lib/api-intelligence.spec.ts`
- `apps/mobile-ops/src/features/self-service/verification-flow.spec.ts`
- `apps/mobile-ops/src/features/remittance/history-helpers.spec.ts`
- `apps/mobile-ops/src/features/remittance/form-helpers.spec.ts`
- `apps/mobile-ops/src/services/remittance-service.spec.ts`

Key regressions now pinned down:

- driver payment references cannot be reused across drivers
- already-applied verification payments are idempotent
- onboarding advances from payment to identity when entitlement is resolved
- guarantor add-on payment application is idempotent
- Full Trust readiness remains blocked until guarantor completion
- remittance history/outstanding calculations are covered in both tenant and mobile layers
- tenancy guard behavior is directly exercised in shared domain and api-core layers
- control-plane intelligence filter/query generation has first regression protection

## Execution Order

1. Add onboarding + payment + guarantor integration tests in `api-core`
2. Add tenancy guard and billing/metering contract tests
3. Add remittance integration tests
4. Add tenant-web critical flow tests
5. Add mobile-ops critical flow tests

## Test Design Rules

- Prefer integration tests over isolated mocks for service-layer orchestration
- Avoid broad snapshot tests
- Avoid low-value unit tests that only restate implementation details
- Pin down source-of-truth state transitions
- Keep tenancy and plane boundaries explicit in all cross-service tests

## Coverage Notes By App

### `apps/api-core`

Current strength:
- some existing service tests already exist

Main gap:
- not enough flow coverage for onboarding, guarantor, billing, metering, and readiness interactions

### `apps/tenant-web`

Current strength:
- broad functionality

Main gap:
- no automated flow protection for critical operator and self-service surfaces

### `apps/mobile-ops`

Current strength:
- real remittance and operator screens

Main gap:
- no regression coverage despite mobile-first importance

### `apps/control-plane-web`

Current strength:
- meaningful billing/lifecycle routes exist

Main gap:
- no tests today; intelligence work in later phases should add first coverage there

### `packages/*`

Current strength:
- strong shared-domain intent

Main gap:
- critical access and domain helpers are not directly tested

## Immediate Next Step

Start with `api-core` onboarding and billing integration tests, because those tests de-risk the rest of the remediation sequence.
