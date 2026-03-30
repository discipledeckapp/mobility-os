# Subscription Payment Method Separation Plan

Date: 2026-03-30
Status: Proposed
Purpose: Separate subscription billing payment methods from verification-funding saved cards so the product model, backend ownership, and tenant UX stay coherent.

## 1. Executive Summary

Mobiris currently uses a saved-card flow that is technically valid, but it is attached to the wrong product concept for subscription billing.

Today:
- saved-card setup is implemented as `card_authorization_setup`
- the resulting card is stored through `api-core/tenant-billing`
- the card is surfaced in `verificationSpend.savedCard`
- tenant-web presents it inside `Verification Funding`

That means the current saved-card implementation is a:
- verification-funding / verification-credit card

It is not yet a proper:
- subscription billing payment method
- invoice autopay enrollment flow
- tenant billing payment profile

This distinction matters because verification funding and subscription billing solve different problems:

- verification funding answers: "can the company pay for driver or guarantor verification right now?"
- subscription billing answers: "how does the tenant pay Mobiris invoices and renew service?"

Both should continue to use payment processors like Paystack or Flutterwave.
Neither should talk directly to card rails.

The fix is not "replace the providers."
The fix is "separate the payment method ownership model."

## 2. Current Implementation Reality

### What exists today

#### Verification-funding saved card

Implemented across:
- `apps/tenant-web/src/app/verification-funding`
- `apps/tenant-web/src/app/wallet/payment-action-panel.tsx`
- `apps/api-core/src/tenant-billing/tenant-billing.service.ts`
- `apps/api-core/src/tenant-billing/verification-spend.service.ts`
- `apps/api-control-plane/src/payments/payments.service.ts`

Behavior:
- tenant starts card setup from verification funding
- control plane initializes `card_authorization_setup`
- provider hosts card entry
- return flow verifies and applies payment
- `api-core` stores provider authorization references in `tenant_saved_cards`
- verification spend uses that card to unlock card-backed verification credit

This is internally coherent for verification spend.

#### Subscription billing payment

Implemented across:
- `apps/tenant-web/src/app/subscription`
- `apps/api-core/src/tenant-billing/tenant-billing.service.ts`
- `apps/api-control-plane/src/billing/*`
- `apps/api-control-plane/src/payments/payments.service.ts`

Behavior:
- tenant sees invoices under subscription
- tenant can start invoice checkout
- control plane verifies and applies invoice settlement
- billing collections service can mark invoices past due
- billing collections service can create retry checkouts

This supports:
- manual invoice payment
- retry checkout
- platform-wallet-assisted settlement

It does not yet support:
- saved billing payment method
- explicit autopay enrollment
- automatic invoice collection against a saved subscription payment method

## 3. Why The Current Model Is Misaligned

### The saved card is semantically owned by verification spend

Evidence:
- tenant-web copy explicitly says "card-backed verification credit"
- `TenantBillingSummaryRecord.verificationSpend.savedCard` is where the card lives in tenant UX
- `VerificationSpendService` is responsible for storing and reading the card
- card activation increases verification spend availability and unlocked tiers

### Subscription UI has no billing payment method concept

The subscription surface currently exposes:
- plan comparison
- outstanding invoice payment
- plan changes

It does not expose:
- billing payment method
- autopay enabled/disabled state
- card on file for SaaS renewal
- automatic retry sequence against a stored billing method

### Resulting product risk

If the team keeps using the verification-funding saved card as the implied answer to subscription billing:
- tenant finance semantics will drift
- billing UX will stay confusing
- future autopay behavior will be difficult to explain
- one saved card may silently carry two meanings without clear consent

## 4. Canonical Target Model

Mobiris should support two distinct payment-method concepts:

### A. Verification Funding Payment Method

Purpose:
- unlock company-paid verification credit
- support verification-specific funding decisions

Owned by:
- tenant-facing orchestration in `api-core/tenant-billing`

Primary tenant surface:
- `/verification-funding`

Key product language:
- saved verification payment method
- verification funding card
- verification credit card

### B. Subscription Billing Payment Method

Purpose:
- pay SaaS invoices
- support renewal and collections
- optionally enable autopay

Owned by:
- control-plane billing and payments domain

Primary tenant surface:
- `/subscription`

Key product language:
- billing payment method
- card on file for subscription
- autopay payment method

### Shared provider principle

Both may use:
- Paystack
- Flutterwave

But the product model must still be distinct even if one provider account powers both.

## 5. Recommended Architecture Decision

### Decision

Do not reuse `verificationSpend.savedCard` as the canonical subscription payment method.

Instead:

1. keep verification-funding card setup as its own bounded concept
2. add a new subscription-billing payment-method concept
3. decide later whether the same provider token may be linked to both by explicit user action

### Why

This preserves:
- product clarity
- billing consent boundaries
- future collections logic
- cleaner reporting and audit trails

## 6. Recommended Implementation Workstreams

### Workstream 1: Billing Payment Method Domain

Objective:
- introduce a first-class subscription billing payment method

Scope:
- control-plane billing model for tenant billing payment method
- status model:
  - active
  - inactive
  - requires_refresh
  - revoked
- provider metadata storage
- explicit ownership by billing, not verification spend

Target backend outcome:
- billing can ask: "does this tenant have a valid billing payment method on file?"

Priority:
- P0

### Workstream 2: Subscription Payment Method Setup Flow

Objective:
- allow tenant admins/finance users to add a card specifically for subscription billing

Scope:
- new subscription-page CTA:
  - Add billing payment method
  - Replace billing payment method
- dedicated checkout purpose for billing setup
  - not `card_authorization_setup` unless generalized safely
- return flow and webhook reconciliation
- billing payment method summary in subscription UI

Target UX outcome:
- `/subscription` clearly shows whether SaaS billing has a card on file

Priority:
- P0

### Workstream 3: Invoice Collections And Autopay

Objective:
- turn manual invoice collection into a proper subscription-billing workflow

Scope:
- collections service chooses:
  - settle from platform wallet if policy allows
  - otherwise attempt saved billing payment method if autopay enabled
  - otherwise expose retry checkout/manual payment
- tenant controls for:
  - autopay on/off
  - preferred billing method
- billing evidence and receipts remain invoice-scoped

Target outcome:
- invoices can be collected through a repeatable, explicit billing policy

Priority:
- P1

### Workstream 4: Verification Funding Card Cleanup

Objective:
- keep verification funding card semantics clean after billing payment method is introduced

Scope:
- rename current saved-card copy to verification-specific language everywhere
- ensure verification funding page never implies it manages subscription autopay
- decide whether card-sharing is:
  - not supported
  - supported only by explicit "use this billing card for verification funding too"

Priority:
- P0

### Workstream 5: Shared Payment Instrument Policy

Objective:
- decide whether one provider token can back both billing and verification funding

Options:

1. Separate instruments only
   - simplest semantics
   - highest clarity
   - more setup friction

2. Shared underlying instrument, separate product consent
   - one provider token may be linked twice
   - still exposed as two product-level payment methods
   - best balance if designed carefully

3. Single universal tenant card
   - lowest friction
   - highest semantic confusion
   - not recommended right now

Recommendation:
- Option 2 if product wants convenience
- Option 1 if product wants maximum clarity first

Priority:
- P1 decision gate

## 7. Data Model Recommendation

### Keep

- `tenant_saved_cards` for verification funding if we want to minimize migration risk initially

### Add

A new billing-owned storage model, conceptually:
- `tenant_billing_payment_methods`

Suggested fields:
- `id`
- `tenantId`
- `provider`
- `providerPaymentMethodRef`
- `providerCustomerRef`
- `last4`
- `brand`
- `status`
- `autopayEnabled`
- `purposeScope`
- `createdAt`
- `updatedAt`
- `initialReference`
- `metadata`

Purpose of the split:
- verification spend should not need to infer billing intent
- billing collections should not depend on verification-spend tables

## 8. API And Service Boundary Recommendation

### api-control-plane

Own:
- subscription billing payment methods
- invoice collection policy
- autopay attempts
- billing payment receipts
- retry and recovery workflow

### api-core

Own:
- tenant-facing orchestration for verification funding
- operationally scoped funding state shown to tenant users
- bridging calls into control-plane billing

### tenant-web

Surface:
- `/subscription`
  - plan
  - invoices
  - billing payment method
  - autopay state
- `/verification-funding`
  - verification balance
  - verification funding top-up
  - verification funding saved card

## 9. Rollout Sequence

### Phase 1

- rename and harden verification-funding saved-card copy
- add architecture/docs for billing payment method separation
- do not yet change verification funding behavior

### Phase 2

- add billing payment method backend model
- add subscription payment method setup endpoint and return flow
- expose billing payment method panel in `/subscription`

### Phase 3

- add autopay preferences
- integrate billing collections with stored billing method
- keep retry checkout as fallback

### Phase 4

- decide whether to share provider instruments across billing and verification funding
- add explicit linking UX only if needed

## 10. Open Product Questions

1. Should one saved card be allowed to fund both subscription billing and verification funding?
2. Is autopay an immediate requirement, or is "card on file for easier retry collection" enough first?
3. Should platform-wallet settlement remain first priority before card collection, or is it only a fallback?
4. Which tenant roles can manage billing payment methods:
   - owner only
   - owner + finance
   - owner + finance + designated admin

## 11. Immediate Recommendation

The next implementation package should be:

1. define billing payment method model in control-plane
2. add subscription payment method section to `/subscription`
3. keep verification-funding saved card separate
4. do not describe verification-funding card setup as subscription card setup

That is the cleanest path to a product-correct architecture without throwing away the existing verification-funding work.
