# Mobile Auth Model

## Current MVP

- mobile-ops still uses the tenant JWT infrastructure
- `api-core` now applies a dedicated `MobileAuthGuard` on `/mobile-ops/*`
- the guard requires:
  - a valid tenant JWT
  - an active tenant user
  - `mobileAccessRevoked = false`
  - a derived mobile role of `driver` or `field_officer`
- session bootstrap exposes:
  - `mobileRole`
  - `mobileAccessRevoked`
- users can view and revoke their own registered push devices
- tenant admins can view team-member registered devices and pause or restore mobile access

## Why This Is Still MVP

The mobile app is not yet on a fully separate mobile identity stack. It still inherits tenant-user login and tenant JWT issuance.

## What Is Now Covered

- push-device registration through the notifications module
- current-user push-device listing and revocation
- team-admin visibility into operator registered devices
- team-admin pause and restore of mobile access through `mobileAccessRevoked`

## Planned Follow-Up

- refresh tokens for mobile sessions
- richer device/session metadata beyond push registration
- stronger distinction between driver mobile access and field-operator mobile access
- dedicated mobile permission bundles instead of reusing the broader tenant role map
