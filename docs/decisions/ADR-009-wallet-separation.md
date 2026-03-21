# ADR-009: Wallet Separation

## Status

Accepted

## Context

Mobility OS manages money in two distinct contexts:

1. **SaaS billing**: the platform needs to track what tenants owe for their subscription and usage
2. **Fleet operations**: tenant businesses manage cash collected from drivers, remittance disbursements, and internal accounting

Early designs showed a risk of these being modeled as a single wallet system, which would create ambiguity in financial reporting, compliance, and revenue recognition.

## Decision

Separate SaaS platform wallets from tenant operational wallets to prevent billing concerns from being mixed with business accounting flows.

- **Platform wallet** (`cp_platform_wallets`): owned by the control plane; used for subscription billing, invoice settlement, and service credits
- **Operational wallet** (`ow_*`): owned by the tenant data plane; used for driver remittance, cash accounting, and internal fleet finance

The platform must never debit an operational wallet to settle a SaaS invoice. Operational wallet transactions must never appear on a SaaS invoice.

## Consequences

### Positive
- SaaS revenue accounting is clean and auditable independently of tenant operations
- Tenant operational accounting is not disrupted by platform billing events
- Easier to comply with financial regulations in different jurisdictions (operational finance vs SaaS billing are governed differently)
- Supports the possibility of the operational wallet being optional (tenants that use an external ERP don't need it)

### Negative
- Two wallet systems to build and maintain
- Developers must be disciplined about which wallet a feature interacts with

### Neutral
- Both wallets use the same double-entry ledger design pattern but in separate schemas

## Alternatives Considered

- **Single unified wallet**: rejected — conflates two financially distinct concerns; creates compliance risk
- **No operational wallet (ERP integration only)**: considered for later phase; operational wallet retained as a first-class feature for tenants without their own ERP

## Related Docs

- [Wallet Model](../platform/wallet-model.md)
- [Subscription & Billing](../platform/subscription-and-billing.md)
