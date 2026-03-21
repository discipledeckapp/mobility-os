# Subscription and Billing

## Core Concepts

| Concept | Description |
|---|---|
| Plan catalog | The set of available plans with their feature matrix and pricing |
| Plan features | Feature entitlements tied to a plan (seat limits, fleet caps, add-ons) |
| Tenant subscription | A tenant's active plan assignment and billing terms |
| Billing cycle | Monthly or annual period over which charges are accumulated |
| Usage events | Metered events (vehicles, drivers, API calls) that feed into variable charges |
| Invoice | Periodic statement of charges due from a tenant |
| Payment | Settlement record for an invoice |
| Service credits | Platform-issued credits applied against invoices |

## Plan Tiers

| Tier | Seat Limit | Fleet Cap | Intelligence | Support SLA |
|---|---|---|---|---|
| Starter | 5 | 50 vehicles | Not included | Standard |
| Growth | 25 | 500 vehicles | Available as add-on | Priority |
| Enterprise | Unlimited | Unlimited | Included | Dedicated |

## Billing Principle

Billing logic must be separated from tenant operational accounting.

- The **platform wallet** (in `cp_platform_wallets`) holds SaaS billing balances and credits
- The **operational wallet** (in `ow_*`) is a tenant business tool for remittance accounting
- These must never be co-mingled — see [ADR-009](../decisions/ADR-009-wallet-separation.md)

## Implementation Status

Currently implemented in `apps/api-control-plane`:
- Plan catalog
- Tenant subscriptions

Defined at the schema and architecture level, but still pending service-module implementation:
- Invoices
- Payments and collections workflow
- Platform wallet operations
- Usage aggregation for billing

## Billing Cycle Flow

Target flow once the remaining control-plane billing modules are wired:

```
Billing period opens
  → usage events are metered throughout period
  → at close: usage is aggregated
  → invoice is generated (base fee + usage overages)
  → platform wallet is debited or invoice sent for external payment
  → payment confirmed → subscription remains active
  → payment missed → grace period → suspension
```

## Invoice Line Items

1. Base subscription fee (plan rate × billing period)
2. Seat overage (users above plan limit × overage rate)
3. Intelligence queries (if applicable)
4. Remittance transaction fee (if applicable)
5. Credit adjustments (service credits, corrections)

## Subscription State Machine

`trialing` → `active` → `past_due` → `suspended` → `terminated`

Upgrades and downgrades take effect at the start of the next billing cycle unless forced by a platform admin.

## Related Docs

- [Wallet Model](./wallet-model.md)
- [Usage Metering](./usage-metering.md)
- [Tenant Lifecycle](./tenant-lifecycle.md)
- [SaaS Business Model](./saas-business-model.md)
