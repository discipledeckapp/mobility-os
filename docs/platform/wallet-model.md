# Wallet Model

Date: 2026-03-30
Status: Current architecture plus terminology warning

## Overview

Mobility OS now has three related but distinct financial concepts:

1. platform billing / SaaS wallet
2. operational wallet
3. verification funding

The original architectural separation in [ADR-009](/Users/seyiadelaju/mobility-os/docs/decisions/ADR-009-wallet-separation.md) remains correct:

- platform wallet and operational wallet must never be co-mingled

However, the product surface has evolved and now also includes verification-funding flows, which sit adjacent to billing but are not the same thing as the operational wallet.

## Wallet Types

### Platform Wallet

Scope:
- owned by the control plane

Purpose:
- SaaS billing
- service credits
- invoice settlement
- billing-side debits and credits

Owner:
- `apps/api-control-plane`

Primary surface:
- `apps/control-plane-web`
- tenant billing summaries where appropriate

### Operational Wallet

Scope:
- owned by the tenant operations plane

Purpose:
- tenant business operational finance
- remittance-related accounting
- internal cash and ledger operations

Owner:
- `apps/api-core`

Primary intended surface:
- tenant operator and finance workflows

Current implementation note:
- backend endpoints exist in `api-core`
- tenant-web no longer cleanly presents this as the canonical `/wallet` experience

### Verification Funding

Scope:
- tenant-facing billing/funding concept for company-paid verification

Purpose:
- wallet, credit, and saved-card-backed ability to fund verification activity
- verification-specific payment and spend state

Owner:
- tenant-facing orchestration in `apps/api-core/tenant-billing`
- underlying platform-side funding and payment integrations via control-plane internals

Primary current surface:
- `apps/tenant-web/src/app/wallet`

Important:
- verification funding is not the operational wallet
- verification funding is not the platform wallet
- verification funding must be kept semantically separate in UX even when it relies on billing-side integrations

## Separation Rules

### Platform Wallet vs Operational Wallet

The platform must never debit an operational wallet to settle a SaaS invoice.
Operational wallet transactions must never appear on a SaaS invoice.

### Verification Funding vs Operational Wallet

Verification funding must not be described as the tenant’s operational remittance wallet.
It is a distinct product concept tied to verification payment coverage, not general operational cash accounting.

### Verification Funding vs SaaS Billing

Verification funding may rely on adjacent billing/payment infrastructure, but users must still understand:

- subscription billing pays for platform access
- verification funding pays for company-funded verification activity
- operational wallet manages tenant business operational finance

## Ledger Principles

- wallet mutations should remain ledger-derived
- entries remain append-only
- initiating references should be explicit
- corrections should be modeled as reversals or superseding entries, not silent mutation

## Current Implementation Status

### Implemented

- platform-wallet and billing infrastructure exist materially in the control plane
- operational-wallet backend endpoints exist in `api-core`
- tenant verification-funding summary and payment-return flows exist in tenant-web

### Incomplete / Needing Clarification

- tenant-web route semantics for wallet-related surfaces
- explicit operational-wallet UX in tenant-web
- clearer IA between:
  - `/subscription`
  - `/wallet`
  - future operational finance surfaces

## Current Recommendation

Do not treat tenant-web `/wallet` as the canonical operational-wallet product surface until route semantics are formally resolved.

Use these terms carefully:

- `platform wallet`
- `operational wallet`
- `verification funding`

Avoid using plain `wallet` without context in implementation planning.

## Related Docs

- [ADR-009: Wallet Separation](/Users/seyiadelaju/mobility-os/docs/decisions/ADR-009-wallet-separation.md)
- [Subscription & Billing](/Users/seyiadelaju/mobility-os/docs/platform/subscription-and-billing.md)
- [Canonical Ownership Matrix](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)
- [Product Intent Recovery Implementation Plan](/Users/seyiadelaju/mobility-os/docs/engineering/product-intent-recovery-implementation-plan.md)
