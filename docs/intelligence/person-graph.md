# Person Graph

## Goal

Maintain a canonical person layer across the platform independent of tenant boundaries. Each real-world person is represented once; all tenant-level records (driver profiles, guarantor records, etc.) link to this canonical person.

## Core Entities

| Entity | Description |
|---|---|
| `person` | Canonical real-world individual; platform-level record |
| `person_identifier` | Config-driven identifier records such as `NATIONAL_ID`, `PASSPORT`, `PHONE`, and `EMAIL` linked to a person |
| `biometric_profile` | Face / fingerprint embedding linked to a person |
| `person_tenant_presence` | Tracks which tenants a person appears in (without exposing tenant data) |
| `person_risk_signal` | Aggregated risk flags associated with the person |

## Design Principles

1. **One person, many presences** — a person can appear in many tenants; each tenant only sees their own data about that person
2. **Biometric uniqueness** — biometric embeddings are stored at the platform layer to enable cross-tenant deduplication
3. **Identifier canonicalization** — identifier types and display labels are country-config driven; normalized values are deduplicated and collisions trigger a review case
4. **Canonical enrichment** — normalized provider-verified identity attributes such as full name, date of birth, address, gender, photo reference, and verification status belong on the canonical person record
5. **Privacy-first access** — cross-tenant signals are surfaced as risk scores, never as raw records from another tenant

## Person Resolution Flow

```
Tenant submits a new person record (e.g. driver onboarding)
  → identity resolution service checks existing identifiers
  → if match found: link to existing canonical person
  → if no match: create new canonical person
  → biometric check: compare embedding against existing profiles
  → if biometric match found: merge review case created
  → person_tenant_presence record created for this tenant
```

## Schema Notes

The person graph lives in the `intel_*` schema prefix, owned by `apps/api-intelligence`. Tenant data planes reference `intel_persons.id` via foreign key but cannot query other columns without going through the intelligence API.

Staff-facing intelligence workflows may access normalized canonical enrichment fields on `intel_persons`. Tenant-facing query endpoints remain restricted to derived signals such as risk score, watchlist state, duplicate-identity flag, and verification confidence.

## Related Docs

- [Identity Resolution](./identity-resolution.md)
- [Biometric Uniqueness](./biometric-uniqueness.md)
- [Cross-Tenant Linkage Policy](./cross-tenant-linkage-policy.md)
- [Risk Scoring Model](./risk-scoring-model.md)
- [ADR-008: Global Person Graph](../decisions/ADR-008-global-person-graph.md)
