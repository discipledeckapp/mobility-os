# Mobility OS Data Inventory

Last updated: 2026-03-27

## Scope

This inventory covers the current Mobility OS product surfaces:
- `tenant-web`
- `control-plane-web`
- `mobile-ops`
- `api-core`
- `api-intelligence`
- `api-control-plane`

## Core data categories

| Category | Examples | Primary purpose | Primary plane |
| --- | --- | --- | --- |
| Account data | name, email, phone, role, user ID | account access, support, tenancy, notifications | tenant plane / control plane |
| Identity verification data | NIN/BVN references, verification status, date of birth, gender, provider-backed portrait, live selfie | identity verification, fraud prevention, platform integrity | intelligence plane |
| Operational mobility data | driver, guarantor, fleet, assignment, remittance, readiness, documents | tenant operations and compliance | tenant plane |
| Financial workflow data | subscription posture, invoices, wallet balances, payment references, remittance amounts | billing, governance, remittance tracking | control plane / tenant plane |
| Intelligence and risk data | canonical person code, risk score, watchlist state, review cases, linkage history | fraud prevention, cross-tenant monitoring, governance | intelligence plane |
| Diagnostics and security | consent logs, audit trails, device push token, session events, rate-limiting and request metadata | security, abuse prevention, support, compliance | all planes |

## Sensitive or high-risk data

Mobility OS processes sensitive data that requires heightened protection:
- biometric verification materials
- provider-returned government identity data
- cross-tenant canonical person linkage
- risk and fraud signals
- guarantor relationship data

## Data minimization controls

- Raw biometric templates remain restricted to the intelligence plane.
- Tenant operators receive derived verification and risk outcomes, not the full cross-tenant graph.
- Identifier values shown to staff are masked where possible.
- Verification consents are versioned and auditable.
- Biometric image references are retained only as long as required under retention policy and cleanup automation.

## User-rights support

Mobility OS now supports authenticated intake for:
- access requests
- correction requests
- deletion requests
- restriction-of-processing requests

These are routed through audited `data_subject_requests` records rather than ad hoc support messages.
