# intelligence-domain

Shared TypeScript package providing intelligence domain types, risk signal value objects, and identity-resolution result types. Used by `api-intelligence`, `api-core`, and any consumer of risk signals.

## What's In Here

| Export | Description |
|---|---|
| `PersonId` | Branded type for canonical person identifiers |
| `RiskScore` | Value object: numeric score (0–100) + band (`low`, `medium`, `high`, `critical`) |
| `RiskBand` | Enum: `low`, `medium`, `high`, `critical` |
| `IdentifierType` | Enum: `NATIONAL_ID`, `PASSPORT`, `DRIVERS_LICENSE`, `PHONE`, `EMAIL`, etc. |
| `ResolutionDecision` | Enum: `auto_linked`, `review_required`, `new_person` |
| `BiometricModality` | Enum: `face`, `fingerprint` |
| `WatchlistEntryType` | Enum of watchlist types |
| `FraudSignalType` | Enum of fraud signal categories |
| `IntelligenceQueryResult` | The permitted response shape for cross-tenant Intelligence API calls |

## Usage

```typescript
import { RiskScore, RiskBand, IntelligenceQueryResult } from '@mobility-os/intelligence-domain';

const score = RiskScore.of(72);
// score.band === 'high'
// score.value === 72
```

## Design Rules

1. No database access — types and value objects only
2. `IdentifierType` values are generic and country-agnostic; country-specific labels belong in `@mobility-os/domain-config`
3. `IntelligenceQueryResult` must never include raw cross-tenant PII — only derived signals
4. No dependency on NestJS or any framework

## Installation

```json
{
  "dependencies": {
    "@mobility-os/intelligence-domain": "workspace:*"
  }
}
```

## Related Docs

- [Person Graph](../../docs/intelligence/person-graph.md)
- [Risk Scoring Model](../../docs/intelligence/risk-scoring-model.md)
- [Cross-Tenant Linkage Policy](../../docs/intelligence/cross-tenant-linkage-policy.md)
- [ADR-008: Global Person Graph](../../docs/decisions/ADR-008-global-person-graph.md)
