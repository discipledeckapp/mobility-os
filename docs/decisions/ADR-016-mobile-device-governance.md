# ADR-016: Mobile Device Governance Within The Notifications Boundary

## Status

Accepted

## Date

2026-03-30

## Context

The mobile product already supported:

- tenant JWT-backed mobile sessions
- `mobileAccessRevoked` at the user level
- push-device registration through the notifications module
- in-app, email, and push-capable notification delivery

What was missing was the operational control layer around those capabilities:

- users could register push devices, but could not see or revoke them
- tenant admins could not see which operator devices were active
- mobile access revocation existed in the data model, but was not surfaced as part of team management

We needed to close those gaps without introducing a parallel device-management subsystem that would conflict with the current architecture.

## Decision

We will keep device registration and device-level revocation inside the existing `notifications` boundary, and we will expose team-level oversight through the existing `team` boundary.

Specifically:

- `notifications` owns:
  - current-user push-device registration
  - current-user push-device listing
  - current-user push-device revocation
- `team` owns:
  - team-member mobile access pause/restore
  - admin visibility into each operator's registered push devices
  - admin revocation of a team member's individual push devices

## Why

This preserves architectural cohesion:

- push devices exist because notifications need delivery targets
- team management already owns operator identity and access governance
- mobile access revocation is a user/account concern, not a notification preference concern

This also avoids a premature dedicated mobile-device domain before we actually need richer concepts such as:

- named devices
- OS version and app version tracking
- device trust state
- hardware attestation
- session history beyond push registration

## Design Patterns

### 1. Current-user self-service first

Expose device visibility and revocation to the signed-in user before building broader admin/device workflows.

### 2. Soft disable over hard delete

Revoking a push device sets `disabledAt` instead of deleting the row. This preserves auditability and leaves room for future recovery or diagnostics.

### 3. Team-admin governance as an extension of team management

Admin device oversight belongs where operators are already managed, rather than in a separate settings area with weak ownership.

### 4. No schema change until richer metadata is required

The existing `UserPushDevice` model is sufficient for:

- push delivery
- current-user visibility
- team oversight
- revocation

Additional metadata should only be added when there is a concrete product need.

## Consequences

### Positive

- users can now see and revoke their own registered devices
- tenant admins can see team-member mobile/device status
- tenant admins can pause mobile access and revoke specific team devices
- push/device governance now aligns with existing auth and notification boundaries

### Negative

- device records are still push-device oriented, not full mobile-session records
- there is still no separate device registration lifecycle for native app trust management
- drivers and field operators are still using the broader tenant-user auth base

## Follow-up

The next mobile-auth/governance slice should add:

- driver and field-operator specific admin views where applicable
- richer device metadata when needed
- clearer separation between push-device records and broader mobile session records
- dedicated mobile permission bundles if the tenant-role map becomes too coarse
