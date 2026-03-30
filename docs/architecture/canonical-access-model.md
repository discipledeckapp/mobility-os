# Canonical Access Model

Date: 2026-03-30
Status: Proposed
Purpose: Define the intended access contract across operator, driver mobile, driver self-service, guarantor self-service, and platform staff experiences.

## 1. Why This Document Exists

Mobiris currently has multiple valid ways to authenticate into the product, but the boundaries between them are easy to blur in implementation.

The current codebase already supports distinct experiences for:

- tenant operator and admin users
- driver mobile users
- driver self-service users
- guarantor self-service users
- platform staff users

The problem is not that these experiences do not exist.
The problem is that the product and code still sometimes treat them as one generalized "logged-in user" problem.

This document defines the canonical access contract so routing, layout selection, guards, invites, password recovery, and deep links can be implemented consistently.

## 2. Canonical Access Experiences

### A. Tenant Operator / Admin

Who this is:
- tenant owners
- fleet managers
- finance/admin users
- operator team users

Primary apps:
- `apps/tenant-web`
- `apps/mobile-ops` operator mode

Source of identity:
- tenant-plane `User` in `api-core`

Expected session shape:
- `role` is an operator/admin tenant role
- `accessMode = tenant_user`
- `mobileRole` may be `field_officer` for some mobile-capable operator accounts
- no self-service subject type

Canonical landing experience:
- `tenant-web` operator shell
- `mobile-ops` operator navigator

Must not fall into:
- driver self-service shell
- guarantor self-service shell

### B. Driver Mobile

Who this is:
- a dedicated tenant-scoped mobile access account linked to one driver record

Primary apps:
- `apps/mobile-ops`

Source of identity:
- tenant-plane `User` in `api-core`
- linked through `User.driverId`

Expected session shape:
- `accessMode = driver_mobile`
- `mobileRole = driver`
- `linkedDriverId` present
- role constrained to tenant-plane mobile semantics

Canonical landing experience:
- driver mobile navigator in `mobile-ops`

Must not fall into:
- tenant operator shell
- guarantor shell

Notes:
- this is an authenticated operational account, not just a temporary onboarding token
- authentication and readiness remain separate concerns

### C. Driver Self-Service

Who this is:
- a driver completing onboarding, verification, document submission, readiness recovery, or account setup

Primary apps:
- `apps/tenant-web`
- partial continuity also exists in `apps/mobile-ops`

Source of identity:
- driver self-service link, token, OTP, and resulting tenant-plane user linkage

Expected session shape after authenticated continuity:
- `selfServiceSubjectType = driver` or equivalent linked-driver continuity
- `selfServiceDriverId` may be present
- `linkedDriverId` may also be present

Canonical landing experience:
- `/driver-self-service/continue` in `tenant-web`
- self-service continuation screens in `mobile-ops` when the session is driver-scoped and still incomplete

Must not fall into:
- tenant operator/admin shell by default
- guarantor flow

Notes:
- this is not the same thing as a fully ready driver mobile account
- a driver may move from self-service continuity into driver mobile usage later

### D. Guarantor Self-Service

Who this is:
- a guarantor completing verification or relationship confirmation for a driver

Primary apps:
- `apps/tenant-web`
- `apps/mobile-ops`

Source of identity:
- guarantor self-service invite/token/OTP flow in the tenant plane

Expected session shape:
- `selfServiceSubjectType = guarantor`

Canonical landing experience:
- `/guarantor-self-service/continue` in `tenant-web`
- guarantor self-service navigator/screens in `mobile-ops`

Must not fall into:
- operator shell
- driver shell

### E. Platform Staff

Who this is:
- platform admins
- billing staff
- support and governance users
- intelligence reviewers

Primary apps:
- `apps/control-plane-web`

Source of identity:
- control-plane staff auth in `api-control-plane`

Expected session shape:
- separate from tenant auth

Canonical landing experience:
- `control-plane-web` platform shell

Must not fall into:
- tenant operator shell
- driver or guarantor experiences

## 3. Canonical Session Signals

### Tenant-Web and Shared Tenant JWT Contract

The current tenant-web and API contract already exposes the right signals:

- `role`
- `accessMode`
- `mobileRole`
- `linkedDriverId`
- `selfServiceSubjectType`
- `selfServiceDriverId`

These signals should be treated with the following precedence:

1. `selfServiceSubjectType = guarantor`
   - guarantor self-service always wins
2. `selfServiceSubjectType = driver`
   - driver self-service continuity wins next
3. `accessMode = driver_mobile` or `mobileRole = driver`
   - driver mobile experience
4. operator/admin tenant role with `accessMode = tenant_user`
   - tenant operator/admin experience

This precedence reflects the product rule that self-service continuity should not be silently dropped just because a user also has a linked driver record.

## 4. Canonical Entry and Routing Contract

| Experience | Primary Entry | Session Source | Canonical Post-Login Destination | Shell / Navigator Owner |
|---|---|---|---|---|
| Tenant operator/admin | `/login` in `tenant-web`, login in `mobile-ops` | tenant auth via `api-core` | `/` in `tenant-web`, operator dashboard in `mobile-ops` | tenant operator shell / operator navigator |
| Driver mobile | login in `mobile-ops` | tenant auth via `api-core` with driver linkage | driver home in `mobile-ops` | driver navigator |
| Driver self-service | invite/deep link/OTP in `tenant-web` or `mobile-ops` | self-service token, OTP, then tenant session continuity | `/driver-self-service/continue` or self-service resume screen | self-service shell |
| Guarantor self-service | invite/deep link/OTP in `tenant-web` or `mobile-ops` | self-service token, OTP, then tenant session continuity | `/guarantor-self-service/continue` or guarantor self-service screen | self-service shell |
| Platform staff | control-plane auth | control-plane session | `/` in `control-plane-web` | control-plane shell |

## 5. Current Implementation Reality

### What Already Matches The Canonical Model

- `api-core` issues tenant auth tokens with:
  - `accessMode`
  - `mobileRole`
  - `linkedDriverId`
  - `selfServiceSubjectType`
  - `selfServiceDriverId`
- `tenant-web` middleware already uses these fields for role-aware redirects
- `tenant-web` login action already redirects using the same continuation helper
- `mobile-ops` already distinguishes:
  - guarantor self-service sessions
  - driver mobile sessions
  - operator sessions

### Where The Current Model Still Drifts

- `mobile-ops` still uses a pre-login role-selection screen even though role should ultimately come from session and continuation state
- driver mobile and driver self-service continuity are still close enough in `mobile-ops` to create conceptual ambiguity
- some docs still describe mobile auth as if it were simpler than the current reality
- access bugs can still happen if route-level defaults assume the operator shell first

## 6. Canonical Guard and Layout Rules

1. Tenant operator routes must require a tenant user session that is not currently routed as guarantor self-service or driver self-service continuity.
2. Driver self-service routes must never render inside the tenant operator shell.
3. Guarantor self-service routes must never render inside the tenant operator shell.
4. Driver mobile endpoints must continue to require mobile-capable tenant auth through `MobileAuthGuard`.
5. Readiness must not be encoded as an auth rule.
   - a user can be authenticated and still not be assignment-ready
6. Platform staff auth must remain entirely separate from tenant auth.

## 7. Canonical Special-Case Behavior

### Invitations

- Driver self-service invitations should resolve into driver self-service continuity first, not generic login home.
- Guarantor invitations should resolve into guarantor continuity first.
- Invitations should preserve the subject type all the way through OTP/account setup.

### Saved Sessions

- revisiting `/` in tenant-web must re-route:
  - guarantor self-service users to guarantor continuation
  - driver self-service users to driver continuation
  - operator users to operator home

### Password Reset

- password reset return should send the user back into a role-aware post-login path
- reset completion must not implicitly collapse every user into the operator shell

### Deep Links

- deep links that target self-service routes must preserve self-service context
- deep links into protected operator routes must respect role-aware guards and redirect safely if the session is not operator-appropriate

## 8. Architecture Risks To Avoid

- Do not use one generic default dashboard route for every tenant-authenticated user.
- Do not assume `linkedDriverId` means "show driver operator detail"; it may mean a driver-scoped experience.
- Do not use readiness state as a substitute for auth state.
- Do not treat the mobile role-selection screen as a source of truth.
- Do not let operator shell layouts wrap self-service flows.

## 9. Implementation Tasks Required

### Phase 1

- align docs and route semantics with the canonical access model
- audit all post-login redirects against the precedence rules in this document
- document the long-term fate of the mobile role-selection screen

### Phase 2

- separate driver mobile home from driver self-service continuation more explicitly in mobile-ops
- harden invitation, password-reset return, and deep-link continuity
- audit all tenant-web protected layouts and route groups for shell leakage

### Phase 3

- consider whether mobile auth should remain tenant-JWT-based long term or evolve into a more explicit mobile identity/session model
- add instrumentation for role-routing mismatches and access-contract regressions

## 10. Decision Summary

The product should no longer be described as having one tenant login that conditionally shows different screens.

It should be described as having distinct canonical access experiences:

- tenant operator/admin
- driver mobile
- driver self-service
- guarantor self-service
- platform staff

That distinction already exists in the product.
Future implementation work should make it explicit, durable, and testable.
