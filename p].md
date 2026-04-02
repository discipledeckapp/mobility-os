# Mobility OS Agent Instructions

## Purpose

This repository implements Mobility OS as a structured multi-tenant SaaS platform with clear plane separation:

- `apps/api-core` — tenant operations plane
- `apps/api-control-plane` — platform governance / SaaS control plane
- `apps/api-intelligence` — canonical person graph, identity intelligence, risk, review workflows

## Non-Negotiable Architecture Rules

1. Do not collapse the control plane, tenant operations plane, and intelligence plane into a single logical service boundary.
2. Do not move canonical person, identity, biometric, review-case, or watchlist logic into tenant-specific driver records.
3. Do not co-mingle platform billing wallets with tenant operational wallets.
4. Do not hardcode country behavior as global platform logic.
5. Country-specific onboarding, identity, and verification behavior must be driven by country configuration.
6. Nigeria is a country profile, not a global default.

## Country Abstraction Rules

1. Every country must be modeled through config and typed contracts.
2. Supported identifiers, provider sequencing, liveness policy, and enrichment fields must be country-driven.
3. Country integrations may enrich canonical person records, but must not overwrite tenant-specific operational records.
4. If a provider is optional or tenant-selectable, that selection belongs in config and/or tenant settings, not in global intelligence logic.
5. Identity provider lookup must run only after required liveness checks for that country pass.

## Canonical Person Rules

1. Canonical person records live in the intelligence plane.
2. Tenant-specific driver profiles remain in the tenant operations plane.
3. Canonical person enrichment may include:
   - verified identifiers
   - normalized full name
   - date of birth
   - address
   - gender
   - photo metadata or secure reference
   - provider verification status
4. Canonical person enrichment must not expose cross-tenant operational data.
5. Tenant driver records may reference canonical persons, but must keep tenant-only operational fields separate.

## Nigeria Identity Rules

1. Nigeria must be implemented as a country profile.
2. Supported Nigeria identifiers are `NIN` and/or `BVN`, represented through generic identifier abstractions.
3. Liveness check must occur before provider lookup.
4. After successful liveness, the configured provider may be called with `NIN` or `BVN`.
5. Provider response may enrich the canonical person record with:
   - full name
   - date of birth
   - address
   - gender
   - photo
   - verification status
6. Tenant-specific driver profiles must not become the storage location for Nigeria provider identity data.

## Change Discipline

1. Prefer additive, bounded changes.
2. Preserve folder boundaries and existing architectural separation.
3. Update docs and types together when introducing country-specific capability.
4. If a requested change would violate country abstraction or plane separation, stop and redesign the proposal before implementation.
