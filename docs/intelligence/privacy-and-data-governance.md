# Privacy and Data Governance

## Objective

Define governance for highly sensitive identity, biometric, and cross-tenant linkage data in compliance with applicable data protection regulations (NDPR, GDPR, and equivalents).

## Data Classification

| Class | Examples | Handling |
|---|---|---|
| Biometric | Face / fingerprint embeddings | Encrypted at rest and in transit; restricted access; deletion on request |
| Government ID | National ID, passport number, driver's licence number | Encrypted at rest; masked in logs; restricted query access |
| Contact PII | Phone, email, name | Encrypted at rest; access-logged |
| Canonical enrichment | Verified name, date of birth, address, gender, photo reference, verification status | Restricted to intelligence-plane staff workflows; never exposed through tenant query endpoints |
| Operational data | Fleet, vehicle, remittance records | Standard encryption; tenant-scoped access |
| Risk signals | Scores, flags (no raw PII) | Accessible to authorized consumers; no tenant cross-exposure |

## Data Residency

- By default, all data is stored in the primary region
- Enterprise tenants may request data residency in a specific jurisdiction (future capability)
- Biometric data must not be transferred outside the originating country without explicit consent

## Retention Policy

| Data Type | Retention Period | Deletion Mechanism |
|---|---|---|
| Biometric embeddings | Until erasure request or account deletion | Secure wipe from `intel_biometric_profiles` |
| Government IDs | 7 years (regulatory minimum) | Archived and access-restricted after termination |
| Audit logs | 7 years | Immutable; access-restricted after retention window |
| Operational data | 5 years after tenant termination | Soft-deleted then hard-deleted per schedule |

## Right to Erasure

When a person submits an erasure request:
1. All PII is removed or anonymised from `intel_persons` and `intel_person_identifiers`
2. Biometric embedding is deleted
3. Risk signals are anonymised (person ID replaced with a tombstone reference)
4. Tenant-side records reference the tombstone; their own data management is their responsibility
5. Audit log entries are retained but the person's PII within them is redacted

## Access Controls

- Biometric data: accessible only to the intelligence service process; no direct DB access for humans
- Government IDs: accessible to authorized support staff with audit logging; masked in API responses
- Canonical enrichment: accessible only on staff-facing intelligence endpoints; not returned from tenant intelligence queries
- Cross-tenant signals: accessible to tenants only through the Intelligence API (never raw data)

## Consent Management

- Tenants are responsible for obtaining consent from their drivers / persons for biometric capture
- Platform provides consent record fields; validation is the tenant's legal responsibility
- Platform privacy policy governs platform-level intelligence processing

## Related Docs

- [Biometric Uniqueness](./biometric-uniqueness.md)
- [Cross-Tenant Linkage Policy](./cross-tenant-linkage-policy.md)
- [Person Graph](./person-graph.md)
