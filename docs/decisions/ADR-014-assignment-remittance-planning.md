# ADR-014: Assignment-Level Remittance Planning and Risk Forecasting

## Status

Accepted

## Context

Mobility OS already records remittance as an operational collection event, but that alone is not enough to manage a fleet business. Operators need to know:

- what amount a driver is expected to remit
- when that remittance is due
- how much cash inflow should be expected this week
- which expected inflows are now at risk because operations changed

Without an explicit planning model, the system can only report historical collections. It cannot answer basic operational finance questions like:

- "How much should come in from all active assignments this week?"
- "Which active assignments are no longer likely to remit because the vehicle is in maintenance?"
- "What should the driver remit today, before they record payment?"

This problem belongs to the tenant operations plane, not the control plane. These remittance expectations are part of a tenant's assignment economics, not SaaS subscription billing.

## Decision

Remittance planning is modeled at the assignment level.

Each assignment may carry explicit remittance terms:

- `remittanceModel`
- `remittanceAmountMinorUnits`
- `remittanceCurrency`
- `remittanceFrequency`
- `remittanceStartDate`
- `remittanceCollectionDay`

These terms are created or confirmed when the assignment is created. They represent the expected operational inflow for that driver-vehicle pairing.

Remittance records remain separate from remittance planning:

- assignment remittance terms = what should be paid
- remittance records = what was actually paid

When a remittance is recorded, the system may default the amount, currency, and due date from the assignment remittance plan. The driver or operator should not need to invent those values at payment time for a planned assignment.

Forecasting is derived from active assignments with remittance terms:

- expected today
- expected this week
- at-risk amount
- at-risk assignment count

At-risk status is derived from operational state, including:

- vehicle in maintenance / inspection / inactive / retired
- driver not active
- driver not assignment-ready
- assignment not in an operational status that should produce remittance

## Consequences

### Positive

- Operators can see projected inflow before collections are recorded
- Driver remittance entry can default from the assignment plan
- Dashboard and readiness surfaces can flag expected cashflow at risk
- Vehicle maintenance now has financial consequences visible in the product

### Negative

- Assignment creation becomes more opinionated because remittance terms are required for planned collection workflows
- Forecasting logic must stay aligned with assignment and readiness transitions
- Historical assignments created before this decision may have incomplete remittance planning data

### Neutral

- This does not merge operational remittance with platform subscription billing
- This does not move wallet logic into the control plane
- This does not change country abstraction rules; currency defaults may be country-informed, but the commercial terms still belong to the tenant assignment

## Alternatives Considered

- **Set remittance only when a payment is recorded**: rejected because it prevents forecasting and makes payment entry ambiguous
- **Store remittance plans at fleet level only**: rejected because assignments still need explicit effective terms and overrides
- **Store remittance plans in platform billing/subscription modules**: rejected because assignment remittance is tenant operational finance, not SaaS billing

## Related Docs

- [ADR-009: Wallet Separation](./ADR-009-wallet-separation.md)
- [ADR-010: Tenant Business Hierarchy](./ADR-010-tenant-business-hierarchy.md)
- [ADR-013: Mobile-First Operator Architecture](./ADR-013-mobile-first-operator-architecture.md)
