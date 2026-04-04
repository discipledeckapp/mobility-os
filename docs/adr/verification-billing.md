# ADR: Verification Billing Model

## Status

Accepted

## Date

2026-04-04

## Context

Mobility OS supports identity verification flows that can be paid for by either:

- the organisation
- the driver
- a separate subject-specific add-on flow such as guarantor verification

The system must keep three concerns separate:

1. entitlement and verification policy resolution
2. payment checkout and payment application
3. subscription metering

Earlier regressions showed what goes wrong when these concerns blur:

- payment was checked more than once in different layers
- verification components were re-gated after payment had already been satisfied
- local runtime mismatches caused `api-core` and `api-control-plane` to disagree on internal billing authentication

This ADR records the intended billing split so future changes do not reintroduce duplicate logic.

## Decision

### 1. `api-core` owns verification policy and entitlement state

`api-core` is the source of truth for:

- which verification tier applies to a driver
- whether a guarantor is required
- whether an add-on payment is required
- whether an existing entitlement is already `paid`, `reserved`, or `consumed`
- whether an already-paid entitlement is sufficient to unlock the next verification step

This logic lives in the tenant plane because it depends on tenant policy, driver state, onboarding state, and verification state.

`api-core` persists verification-billing state in its own domain tables:

- `verification_entitlements`
- `verification_attempts`
- related verification charge audit records and billing profiles

This makes the tenant plane the owner of verification unlock state even though checkout and settlement are delegated to the control plane.

### 2. `api-control-plane` owns payment checkout and payment application

The control plane is responsible for:

- creating payment checkout sessions
- verifying provider payment references
- applying settled payments to platform billing records
- returning normalized checkout/application responses to `api-core`

`api-core` reaches these routes through signed internal-service calls via:

- [control-plane-billing.client.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/tenant-billing/control-plane-billing.client.ts)

The internal routes are exposed by:

- [payments-internal.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-control-plane/src/payments/payments-internal.controller.ts)

This keeps PSP integration and platform-level billing records in the control plane.

### 3. Entitlements are not the same thing as metering

Verification billing uses **entitlements**.
Subscription capacity uses **metering**.

These are separate on purpose.

- Entitlements answer: "May this subject perform this verification flow now?"
- Metering answers: "How much subscription usage has this tenant consumed?"

`api-core` sends usage metering events through:

- [control-plane-metering.client.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/tenant-billing/control-plane-metering.client.ts)

Those events are fire-and-forget and must never decide verification unlock state.

### 4. No duplicate payment gating across layers

Once `api-core` has resolved that an entitlement/payment state already satisfies a verification component, downstream verification logic must not independently reopen payment checks.

The verification execution path may consult:

- policy
- entitlement state
- attempt history
- verification results

It must not invent a second billing decision deeper in the verification flow.

### 5. Plane boundaries stay intact

- `api-core`
  - tenant policy
  - onboarding rules
  - entitlement state
  - operational verification state
- `api-control-plane`
  - PSP checkout
  - payment verification
  - billing settlement records
- `api-intelligence`
  - identity resolution
  - person graph
  - risk and review state

The intelligence plane must not decide billing.
The control plane must not decide tenant verification policy.

## Sequence Diagrams

### A. Driver-paid verification checkout

```text
Driver self-service
  -> api-core
     resolve tier/policy for driver
     check existing entitlement state
     if payment required:
       -> ControlPlaneBillingClient
          -> api-control-plane /internal/payments/driver-kyc-checkouts
             create PSP checkout
          <- checkout response
     <- checkout_required + redirect URL
```

### B. Payment verification and entitlement application

```text
Driver self-service
  -> api-core
     submit provider + payment reference
     read existing entitlement
     -> ControlPlaneBillingClient.verifyAndApplyPayment
        -> api-control-plane /internal/payments/verify-and-apply
           verify provider reference
           apply billing settlement
        <- normalized payment application
     api-core updates/creates verification_entitlement
     api-core persists payment reference on driver when relevant
  <- verified / already_applied
```

### C. Verification execution after payment

```text
Driver self-service
  -> api-core
     resolve verification policy
     read entitlement state
     if entitlement already satisfies required tier/component:
       proceed to verification
       -> api-intelligence
          perform identity/document verification
       <- verification result
     persist attempt + verification outcome
  <- verification response
```

### D. Subscription usage metering

```text
Tenant action in api-core
  -> SubscriptionEntitlementsService / operational flow
  -> ControlPlaneMeteringClient.fireEvent
     -> api-control-plane /internal/metering/usage-events
  <- no blocking dependency
```

## Rationale

This model was chosen because it:

- keeps tenant verification state close to tenant onboarding policy
- keeps payment-provider integration in the control plane
- avoids mixing subscription metering with transactional verification purchase state
- preserves cross-plane discipline while allowing driver-paid and organisation-paid flows to coexist
- allows retries and re-verification without duplicating payment checks in downstream execution code

## Consequences

### Positive

- Verification unlock logic has a single owner in `api-core`
- PSP and billing integrations stay isolated in `api-control-plane`
- Subscription metering remains independent from one-off verification payment state
- Regression testing can target the payment -> entitlement -> verification chain directly

### Negative

- Cross-plane runtime configuration must stay aligned, especially internal JWT secrets
- Checkout success does not itself unlock verification until `api-core` persists the entitlement/application result
- More coordination is required when changing billing DTOs across planes

### Neutral

- The tenant plane stores verification entitlement state even when the actual payment transaction is settled elsewhere
- Some local/dev flows need seeded mocks or deterministic fallback handling to exercise end-to-end verification reliably

## Alternatives Considered

### A. Let the control plane decide verification unlock state

Rejected.

That would force tenant-specific onboarding and verification policy into the control plane and blur plane ownership.

### B. Treat verification charges as generic subscription metering

Rejected.

Verification purchases and subscription usage are different financial models.
Metering is aggregated usage.
Verification charges are subject-specific transactional entitlements.

### C. Re-check funding in downstream verification components

Rejected.

This caused regressions, duplicate logic, and contradictory user states.

## Implementation Notes

- Internal service auth between `api-core` and `api-control-plane` must use the same `INTERNAL_SERVICE_JWT_SECRET`
- Verification flows should read existing entitlement state before creating new checkout requests
- A `consumed` entitlement may still satisfy a verification path if the required component has already been funded and the verification state allows retry/resume
- Manual-review and risk state from `api-intelligence` may affect readiness, but must not reopen billing checks

## Related Files

- [control-plane-billing.client.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/tenant-billing/control-plane-billing.client.ts)
- [control-plane-metering.client.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/tenant-billing/control-plane-metering.client.ts)
- [subscription-entitlements.service.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/tenant-billing/subscription-entitlements.service.ts)
- [payments-internal.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-control-plane/src/payments/payments-internal.controller.ts)
- [drivers.service.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/drivers/drivers.service.ts)
- [ADR-009-wallet-separation.md](/Users/seyiadelaju/mobility-os/docs/decisions/ADR-009-wallet-separation.md)
- [ADR-004-control-plane-vs-tenant-plane.md](/Users/seyiadelaju/mobility-os/docs/decisions/ADR-004-control-plane-vs-tenant-plane.md)
