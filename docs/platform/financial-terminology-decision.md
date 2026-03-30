# Financial Terminology Decision

Date: 2026-03-30
Status: Proposed
Purpose: Define the canonical product language for money-related concepts across tenant operations, verification funding, and SaaS billing.

## 1. Decision Summary

Mobiris currently uses overlapping wallet and billing language for three different concepts.
That ambiguity is now a product risk.

The canonical terminology going forward should be:

- Operational Wallet
- Verification Funding
- Subscription Billing
- Platform Wallet

These terms must not be used interchangeably.

## 2. Canonical Definitions

### Operational Wallet

What it is:
- tenant operational finance related to day-to-day fleet operations
- remittance-adjacent internal cash and ledger visibility

Owned by:
- `api-core`

Primary users:
- tenant operators
- tenant finance/admin users

Examples of valid language:
- operational wallet
- operating balance
- remittance settlement visibility

Should not be called:
- verification wallet
- subscription wallet
- platform wallet

### Verification Funding

What it is:
- the tenant-funded balance or payment coverage used for driver and guarantor verification activities
- the finance layer that unlocks verification workflows when a company is paying

Owned by:
- tenant-facing orchestration in `api-core/tenant-billing`
- underlying platform payment infrastructure coordinated with control-plane internals

Primary users:
- tenant admins
- tenant finance users
- operator workflows that need to fund verification

Examples of valid language:
- verification funding
- verification balance
- fund verification
- verification payment status

Should not be called:
- operational wallet
- remittance wallet
- subscription wallet

### Subscription Billing

What it is:
- SaaS plan, invoices, collections, receipts, credits, and account billing state for using Mobiris itself

Owned by:
- `api-control-plane`

Primary users:
- tenant admins
- tenant finance users
- platform billing operations

Examples of valid language:
- subscription
- billing
- invoice
- plan

Should not be called:
- wallet
  unless there is a very specific platform-billing reason

### Platform Wallet

What it is:
- the internal control-plane financial construct used for platform-side billing, collection, or payment orchestration

Owned by:
- `api-control-plane`

Primary users:
- platform staff

Should not be surfaced to tenant users as a substitute for:
- operational wallet
- verification funding
- subscription billing

## 3. Route and Navigation Recommendation

### Tenant-Web

Recommended route semantics:

- `/subscription`
  - subscription billing, invoices, plan management
- `/verification-funding`
  - company-funded verification balance and payment actions
- `/wallet`
  - operational wallet only

If the product is not ready to restore `/wallet` as operational wallet immediately, the interim state should still be documented clearly:

- current implementation: `/wallet` behaves as verification funding
- target implementation: `/verification-funding` becomes the verification funding home and `/wallet` returns to operational finance

### Control-Plane Web

- platform billing and platform wallet surfaces remain control-plane concerns
- tenant-facing terminology should prefer plan, invoice, billing, and subscription over wallet

## 4. Copy and UX Rules

1. Use money language for semantic meaning, not generic decoration.
2. Do not label every stored-value concept as a wallet.
3. When the user is paying for verification, say verification funding.
4. When the user is paying Mobiris for the SaaS product, say subscription or billing.
5. When the user is viewing operational finance tied to remittance workflows, say operational wallet.

## 5. Current Misalignment

The current biggest mismatch is:

- `tenant-web /wallet` behaves as verification funding
- older docs still describe `/wallet` as the operational wallet surface

That is survivable in code but harmful in product understanding.

## 6. Required Follow-Up Work

### Immediate

- update planning and architecture docs to use these terms consistently
- stop using "wallet" as a generic umbrella term in new work

### Next Implementation Phase

- decide the route migration strategy:
  - move verification funding to `/verification-funding`
  - restore `/wallet` to operational wallet
  - or deliberately keep the current route but rename navigation and copy in a way that removes ambiguity

### Validation Questions

- Do operators actually need a dedicated operational wallet command center now, or is remittance history sufficient until later?
- Should verification funding live near driver verification flows, or near subscription/billing for finance users?
- What minimum billing evidence, receipts, and history must tenant users see directly?
