# Nigeria Country Profile

## Purpose

Define Nigeria-specific operational and identity behavior for Mobility OS without turning Nigeria into a platform-wide hardcoded rule.

## Scope

This profile applies when a tenant, business entity, operating unit, or enrollment flow is configured for country code `NG`.

## Identity Context

Nigeria identity verification is modeled as a country-specific capability within the intelligence plane.

Supported verification identifiers:
- `NIN` mapped to generic identifier type `NATIONAL_ID`
- `BVN` mapped to generic identifier type `BANK_ID`

These labels are Nigeria-specific display and provider concepts. Core platform logic should continue to operate on generic identifier abstractions.

## Verification Flow

Nigeria identity verification follows this sequence:

1. Enrollment payload is submitted with one or more configured Nigeria-supported identifiers
2. Required liveness check is performed first
3. Only if liveness succeeds, the configured Nigeria identity provider chain may be called
4. Provider lookup may be performed with `NIN` or `BVN`
5. Providers are attempted in configured priority order
6. Retryable provider-unavailable or provider-error outcomes may fall through to the next configured provider
7. Provider-native responses are normalized into canonical person enrichment fields
8. Intelligence plane decides whether to create, auto-link, or route to review

## Required Liveness Rule

For Nigeria identity provider lookups:
- liveness check is mandatory before provider lookup
- provider lookup must not run if liveness fails
- failed liveness may create a fraud/risk signal depending on policy
- liveness outcome belongs to the intelligence plane verification workflow, not tenant driver records

## Provider Ordering And Fallback

Nigeria provider integrations must be configured as an ordered list, not embedded as hardcoded control flow in the matching engine.

Current configured pattern:
- liveness providers: configurable ordered chain
- lookup primary provider: `youverify`
- lookup fallback provider: `smile_identity`

Recommended governance pattern:
- liveness providers may include `amazon_rekognition`, `smile_identity`, `youverify`, or another approved provider such as `internal_free_service`
- lookup providers remain an ordered list separate from liveness provider choice
- platform-admin configuration governs the active liveness provider and lookup ordering
- control-plane validation must reject country/provider combinations that are not supported by the country capability matrix

Default controlled bootstrap pattern:
- control-plane bootstrap may seed `identity_verification_routing` for `NG`
- seeded default liveness chain: `amazon_rekognition`, then `youverify`, then `smile_identity`
- seeded default lookup order: `youverify`, then `smile_identity`
- seeded default fallback policy: fallback on provider error/unavailable, but not on `no_match`

Current implementation state:
- `amazon_rekognition` supports backend-driven liveness session creation and result evaluation
- `youverify` supports backend-driven liveness session generation and backend identity lookup
- `smile_identity` is currently integrated as a configurable liveness/lookup adapter slot, but its liveness path is still evidence/mock-backed until a stable raw server-side token/session contract is implemented

Fallback rules:
- fallback is allowed when the current provider is unavailable or returns a technical/provider error
- fallback is not the correct response to a real identity mismatch or `no_match` result
- all provider responses must be normalized into a shared internal verification shape before matching uses them

## Liveness Session Initiation

The intelligence plane now supports staff-side liveness session initiation before lookup:

- Amazon Rekognition sessions can be created directly by the backend
- YouVerify SDK liveness sessions can be generated directly by the backend
- Smile Identity remains part of the configured chain, but direct backend session/token generation is pending a stable server-side contract in the implementation

This preserves the separation between:
- liveness session initialization
- liveness result evaluation
- identifier lookup
- canonical person enrichment

It also preserves provider safety:
- the control plane validates that configured liveness providers are actually supported for Nigeria
- the intelligence plane defensively skips unsupported providers even if an invalid override somehow appears

## Provider Response Enrichment

A successful Nigeria provider response may enrich the canonical person record with:
- full name
- date of birth
- address
- gender
- photo
- verification status

This enrichment must be attached to the canonical person layer in the intelligence plane.

## Separation of Records

### Canonical Person Record
Owned by the intelligence plane and may contain:
- normalized identifiers
- provider-verified identity attributes
- verification confidence
- provider verification status
- derived risk and review flags

### Tenant Driver Profile
Owned by the tenant operations plane and may contain:
- tenant employment/onboarding state
- fleet assignment and operational status
- remittance and operational metrics
- tenant-only notes and documents

Provider identity enrichment from Nigeria verification must not be stored as tenant-global truth in driver records.

## Configuration Expectations

Nigeria profile configuration should define:
- supported identifier labels and mappings
- whether `NIN`, `BVN`, or both are enabled
- liveness requirement and liveness provider
- ordered provider list and fallback policy
- allowed enrichment fields
- any retention or masking constraints for returned identity data

## Related Docs

- [Identity Resolution](../intelligence/identity-resolution.md)
- [Person Graph](../intelligence/person-graph.md)
- [Privacy & Data Governance](../intelligence/privacy-and-data-governance.md)
- [ADR-005: Country Abstraction](../decisions/ADR-005-country-abstraction.md)
