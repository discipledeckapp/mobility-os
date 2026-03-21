# Cross-Tenant Linkage Policy

## Objective

Define when and how a person can be linked across tenants while respecting governance and access boundaries. The platform must never expose one tenant's data to another tenant, even when the underlying person is the same.

## Core Rule

> A tenant can only see their own records about a person. Cross-tenant data is surfaced exclusively as platform-level risk signals — not as raw records.

## What Is Shared (Risk Signals)

The following are derived signals that tenants may receive when querying the Intelligence API:

| Signal | Description |
|---|---|
| `personId` | Canonical platform person identifier |
| `globalRiskScore` | Aggregate risk score derived from all platform-level signals |
| `riskBand` | Derived band for the global risk score |
| `isWatchlisted` | Boolean — person appears on a platform watchlist |
| `hasDuplicateIdentityFlag` | Boolean — unresolved identity conflict exists for this person |
| `fraudIndicatorCount` | Count of fraud signals (no source attribution) |
| `verificationConfidence` | Confidence of the most recent identity verification |

Field names in this policy should mirror the exported `IntelligenceQueryResult` contract in `packages/intelligence-domain`.

## What Is Never Shared

- Records from another tenant's operational data (driver profile, remittance history, etc.)
- Which other tenants a person works with
- Raw biometric data from another tenant's enrollment
- Any PII beyond what the querying tenant already submitted

## Consent and Disclosure

- Tenants must inform drivers / persons that identity data is processed at a platform level for fraud prevention
- Platform privacy policy must disclose the cross-tenant risk signal model
- Individual persons can request deletion (right to erasure) which triggers the erasure policy in [Privacy & Data Governance](./privacy-and-data-governance.md)

## Linkage Authorization

| Action | Authorized by |
|---|---|
| Auto-link (high confidence) | Intelligence service (automated) |
| Manual linkage review | Platform intelligence reviewer |
| Forced separation (after dispute) | Platform admin + legal approval |

## Audit Trail

All linkage events (creation, merge, separation) are recorded in `intel_linkage_events` with:
- Timestamp, actor (system or reviewer ID), reason code, confidence score

## Related Docs

- [Person Graph](./person-graph.md)
- [Identity Resolution](./identity-resolution.md)
- [Privacy & Data Governance](./privacy-and-data-governance.md)
- [Risk Scoring Model](./risk-scoring-model.md)
