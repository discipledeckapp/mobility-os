# billing-domain

Shared TypeScript package providing billing domain types, value objects, and calculation utilities. Used by `api-control-plane` and any service that needs to understand billing concepts.

## What's In Here

| Export | Description |
|---|---|
| `Money` | Immutable value object for monetary amounts with currency |
| `BillingCycle` | Type representing a billing period (start date, end date, interval) |
| `PlanId` / `SubscriptionId` / `InvoiceId` / `PlatformWalletId` | Branded types |
| `PlanTier` | Enum: `starter`, `growth`, `enterprise` |
| `BillingInterval` | Enum: `monthly`, `annual` |
| `InvoiceStatus` | Enum: `draft`, `open`, `paid`, `void`, `uncollectible` |
| `SubscriptionStatus` | Enum: `trialing`, `active`, `past_due`, `suspended`, `terminated` |
| `TERMINAL_SUBSCRIPTION_STATUSES` | Set of terminal subscription states |
| `calculateProration()` | Utility for prorating a charge over a partial billing period |
| `applyCredits()` | Utility to apply service credits against an invoice amount |
| `WalletEntryType` | Enum of ledger entry types for the platform wallet |

## Usage

```typescript
import { Money, PlanTier, calculateProration } from '@mobility-os/billing-domain';

const base = Money.of(5000, 'NGN');
const prorated = calculateProration(base, billingCycle, effectiveDate);
```

## Design Rules

1. No database access — types and pure functions only
2. `Money` is always represented as integer minor units (kobo, cents) + ISO currency code — never as a float
3. Billing primitives describe the domain contract; they do not imply that all control-plane billing modules are already implemented
4. No dependency on NestJS or any framework

## Installation

```json
{
  "dependencies": {
    "@mobility-os/billing-domain": "workspace:*"
  }
}
```

## Related Docs

- [Subscription & Billing](../../docs/platform/subscription-and-billing.md)
- [Wallet Model](../../docs/platform/wallet-model.md)
- [ADR-009: Wallet Separation](../../docs/decisions/ADR-009-wallet-separation.md)
