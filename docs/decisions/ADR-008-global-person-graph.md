# ADR-008: Global Person Graph

## Status

Accepted

## Context

Each tenant onboards drivers and other persons independently. Without a shared person layer:
- The same real-world person can appear in many tenants with no deduplication
- A fraudulent driver banned by one tenant can freely onboard with another
- Biometric re-enrollment cannot detect duplicates across tenant boundaries

The platform can create significant value by offering cross-tenant identity intelligence — but only if the underlying person records are modeled at the platform level.

## Decision

Introduce a platform-wide canonical person layer to support identity deduplication, biometric uniqueness, and cross-tenant risk intelligence.

- The person graph lives in `apps/api-intelligence` with schema prefix `intel_*`
- Every person enrolled by any tenant gets a canonical `intel_persons` record
- Tenant-level records (driver profiles, guarantor records) carry a `person_id` foreign key
- Cross-tenant signals are surfaced as risk scores only — never as raw records from other tenants
- Biometric embeddings are stored at the platform level, not per-tenant

## Consequences

### Positive
- Enables cross-tenant fraud detection and risk scoring
- Biometric uniqueness guarantee across the entire platform
- Provides a foundation for the Intelligence add-on revenue stream
- Reduces identity fraud and duplicate onboarding

### Negative
- Introduces a platform-level data store that holds sensitive PII and biometrics
- Requires strict access controls and data governance (see [Privacy & Data Governance](../intelligence/privacy-and-data-governance.md))
- Identity resolution adds latency to driver onboarding flow

### Neutral
- Tenants remain unaware of other tenants' data; cross-tenant exposure is limited to derived signals

## Alternatives Considered

- **Per-tenant deduplication only**: rejected — does not address cross-tenant fraud
- **Shared blacklist only (no full person graph)**: considered for phased rollout; full graph retained as target architecture

## Related Docs

- [Person Graph](../intelligence/person-graph.md)
- [Identity Resolution](../intelligence/identity-resolution.md)
- [Biometric Uniqueness](../intelligence/biometric-uniqueness.md)
- [Cross-Tenant Linkage Policy](../intelligence/cross-tenant-linkage-policy.md)
