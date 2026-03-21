# Identity Resolution

## Goal

Resolve whether multiple records refer to the same real-world person using identifiers, biometric evidence, and country-configured verification rules.

## Resolution Inputs

| Input | Weight | Notes |
|---|---|---|
| Government identifier (`NATIONAL_ID`, `PASSPORT`, `DRIVERS_LICENSE`, etc.) | High | Exact match on normalized ID value; available types come from country config |
| Financial identifier (`BANK_ID`, where enabled) | High | Used only in countries where configured and legally permitted |
| Phone number | Medium | Normalized E.164 format |
| Email address | Medium | Lowercase normalized |
| Face embedding | High | Cosine similarity above threshold |
| Fingerprint embedding | High | Match score above threshold |
| Full name + DOB | Low | Fuzzy match; used as supporting signal only |
| Provider enrichment result | Medium | Verified provider response may strengthen confidence after required pre-checks pass |

## Resolution Algorithm

1. **Country-configured pre-checks** — determine the applicable country profile and enforce required sequencing
2. **Liveness gate** — if the country profile requires liveness before provider lookup, liveness must succeed first
3. **Exact identifier lookup** — check whether any submitted normalized identifier already belongs to an existing canonical person
4. **Biometric sweep** — compare submitted biometric evidence against the candidate pool or active biometric set
5. **Provider verification (if configured)** — after required liveness succeeds, call the configured provider chain using an allowed identifier such as `NIN` or `BVN`
6. **Provider normalization and fallback** — normalize provider-native responses into a shared result shape; fall back only on provider failure or unavailability, not on a real `no_match`
7. **Confidence scoring** — combine identifier matches, biometric evidence, provider verification, and supporting demographic evidence
8. **Decision**:
   - Score ≥ HIGH_THRESHOLD → auto-link to existing person
   - MEDIUM_THRESHOLD ≤ score < HIGH_THRESHOLD → create a review case for manual adjudication
   - Score < MEDIUM_THRESHOLD → create new canonical person

## Thresholds (Initial)

| Decision | Threshold | Notes |
|---|---|---|
| Auto-link | ≥ 0.95 | Subject to tuning after pilot data |
| Review case | 0.75 – 0.94 | Human review required |
| New person | < 0.75 | — |

## Provider Enrichment

Country-configured identity providers may return verified identity attributes including:
- full name
- date of birth
- address
- gender
- photo
- verification status

When allowed by policy and config, this data enriches the canonical person record in the intelligence plane.

It must not replace or collapse tenant-specific operational records such as driver profiles.

## Nigeria-Specific Example

For Nigeria:
- supported identifiers may include `NIN` and/or `BVN`
- `NIN` maps to generic identifier type `NATIONAL_ID`
- `BVN` maps to generic identifier type `BANK_ID`
- liveness must occur before provider lookup
- after successful liveness, the configured provider chain may be called with `NIN` or `BVN`
- `youverify` may be primary while `smile_identity` is configured as fallback
- fallback applies to provider failure, not to a real identity mismatch
- provider response enriches the canonical person record, not the tenant driver profile

## Review Cases

When auto-resolution is not possible:
- a `review_case` record is created with the conflicting evidence
- a platform intelligence reviewer adjudicates
- resolution: merge persons, reject linkage, or flag as fraud

## Edge Cases

- **Identifier reuse** — some ID numbers appear across multiple individuals; always require corroborating evidence for high-confidence links
- **Name changes** — surname changes after marriage must not break linkage; rely on verified identifiers over name alone
- **Biometric degradation** — poor-quality images produce low-confidence embeddings; reject rather than false-match
- **Provider mismatch** — provider response may disagree with submitted data; enrich carefully and route to review when confidence is not sufficient
- **Country drift** — core logic must not assume every country supports the same identifiers or provider order of operations

## Country Configuration

The identity-resolution engine must work with generic identifier types from shared domain types, while country-specific labels, supported identifier sets, required pre-checks, provider selection, and enrichment rules come from country configuration.

## Related Docs

- [Person Graph](./person-graph.md)
- [Biometric Uniqueness](./biometric-uniqueness.md)
- [Risk Scoring Model](./risk-scoring-model.md)
- [Privacy & Data Governance](./privacy-and-data-governance.md)
- [ADR-005: Country Abstraction](../decisions/ADR-005-country-abstraction.md)
