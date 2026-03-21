# Risk Scoring Model

## Risk Layers

| Layer | Scope | Owner |
|---|---|---|
| Global person risk score | Platform-wide; derived from all tenants' signals | Intelligence service |
| Tenant-specific operational risk | Per-tenant; derived from tenant's own data | Tenant data plane |
| Verification confidence | Per identity check; reflects match quality | Intelligence service |
| Incident history | Fraud flags, disputes, past suspensions | Intelligence service |

## Global Risk Score

The global risk score (0–100, higher = more risk) is computed from:

| Signal | Weight |
|---|---|
| Watchlist match | High |
| Unresolved biometric conflict | High |
| Duplicate identity flag | High |
| Fraud indicator count | Medium |
| Verification confidence (inverse) | Medium |
| Incident count (platform-wide) | Low |

Score is recalculated whenever any contributing signal changes.

## Tenant-Facing Intelligence Output

Tenants do not receive the full underlying risk evidence. The Intelligence API returns a derived response shape only:

| Field | Description |
|---|---|
| `personId` | Canonical platform person identifier |
| `globalRiskScore` | Aggregate risk score from 0 to 100 |
| `riskBand` | Derived band: `low`, `medium`, `high`, `critical` |
| `isWatchlisted` | Boolean indicating platform watchlist presence |
| `hasDuplicateIdentityFlag` | Boolean indicating an unresolved identity conflict |
| `fraudIndicatorCount` | Count of active fraud signals without source attribution |
| `verificationConfidence` | Most recent verification confidence from 0.0 to 1.0 |

This contract must stay aligned with `IntelligenceQueryResult` in `packages/intelligence-domain`.

## Tenant Operational Risk Score

Tenants may compute their own risk score using:
- Driver incident records (accidents, violations)
- Remittance default history
- Assignment cancellation rate
- Document expiry status

This score lives in the tenant data plane and is not shared cross-tenant.

## Score Consumption

| Consumer | How It's Used |
|---|---|
| Tenant driver onboarding | Gate or flag high-risk drivers |
| Tenant assignment engine | Deprioritize high-risk drivers for assignments |
| Platform intelligence reviewers | Prioritize manual review and watchlist decisions |
| Watchlist service | Trigger watchlist review if score exceeds threshold |

## Score Bands

| Band | Score Range | Recommended Action |
|---|---|---|
| Low | 0–30 | Proceed normally |
| Medium | 31–60 | Flag for review |
| High | 61–80 | Require manual approval |
| Critical | 81–100 | Block; escalate to platform reviewer |

## Related Docs

- [Person Graph](./person-graph.md)
- [Watchlist & Fraud Signals](./watchlist-and-fraud-signals.md)
- [Identity Resolution](./identity-resolution.md)
- [Cross-Tenant Linkage Policy](./cross-tenant-linkage-policy.md)
