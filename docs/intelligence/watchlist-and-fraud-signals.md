# Watchlist and Fraud Signals

## Purpose

Capture fraud indicators, duplicate identity concerns, blacklist data, and repeated risk patterns across the platform.

## Watchlist Types

| Type | Description | Source |
|---|---|---|
| Platform blacklist | Persons permanently barred from all tenants | Platform admin decision |
| Fraud suspect | Active fraud investigation in progress | Intelligence review team |
| Duplicate identity | Unresolved identity conflict (multiple persons suspected to be same individual) | Identity resolution engine |
| Document fraud | Government ID suspected to be forged or misused | Verification service |
| External watchlist | Government sanctions, criminal databases (where legally permissible) | External data feed |

## Signal Types

| Signal | Description |
|---|---|
| `biometric_conflict` | Two enrollments matched to same biometric; not yet resolved |
| `identifier_reuse` | Same government ID used across multiple distinct persons |
| `liveness_failure` | Repeated liveness detection failures on enrollment |
| `high_churn_pattern` | Person repeatedly onboarded and removed across tenants |
| `remittance_default` | Repeated remittance defaults across tenants (anonymised count) |

## Watchlist Operations

- **Add to watchlist**: platform admin or automated rule; always requires a reason code
- **Remove from watchlist**: platform admin only; requires review note and approval
- **Escalate to external**: formal request to share with law enforcement (requires legal approval)

## Tenant Visibility

Tenants receive:
- `is_watchlisted: boolean` — from the Intelligence API
- They do **not** receive the reason, source, or other tenants' data

## Signal Ingestion

Fraud signals can be contributed by:
1. Automated intelligence rules (e.g. biometric conflict detected)
2. Tenant reports (tenant flags a driver; reviewed by platform before acting)
3. External feeds (sanctions lists, where enabled by country config)

All ingested signals are immutable; corrections are made by adding a superseding signal.

## Related Docs

- [Risk Scoring Model](./risk-scoring-model.md)
- [Cross-Tenant Linkage Policy](./cross-tenant-linkage-policy.md)
- [Privacy & Data Governance](./privacy-and-data-governance.md)
