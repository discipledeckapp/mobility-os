# Biometric Uniqueness

## Objective

Ensure biometric presence is modeled at the platform level to reduce duplicate or fraudulent identities across tenants. A single real-world person should have at most one canonical biometric profile.

## Supported Modalities

| Modality | Implementation | Stored Artifact |
|---|---|---|
| Face | Face embedding vector (512-dim) | Embedding + quality score |
| Fingerprint | Minutiae-based embedding | Embedding + quality score |

Raw biometric images are **not** stored permanently — only the derived embeddings.

## Uniqueness Guarantee

At enrollment:
1. The submitted biometric is compared against all existing embeddings of the same modality
2. If a match is found above the deduplication threshold → a `biometric_conflict` review case is raised
3. If no match → embedding is stored and linked to the canonical person

This ensures one person = one biometric profile, even across tenants.

## Storage and Encryption

- Embeddings are stored in `intel_biometric_profiles`
- Encrypted at rest using AES-256
- Access is restricted to the intelligence service; no direct tenant access
- Deletion follows the data retention and right-to-erasure policy in [Privacy & Data Governance](./privacy-and-data-governance.md)

## Quality Gates

| Modality | Minimum Quality Score | Action on Fail |
|---|---|---|
| Face | 0.70 | Reject image; prompt re-capture |
| Fingerprint | 0.65 | Reject image; prompt re-capture |

## Liveness Detection

All face captures must pass a liveness check before the embedding is accepted. Liveness results are stored alongside the enrollment event.

## Related Docs

- [Person Graph](./person-graph.md)
- [Identity Resolution](./identity-resolution.md)
- [Privacy & Data Governance](./privacy-and-data-governance.md)
