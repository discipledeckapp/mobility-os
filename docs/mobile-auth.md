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

## Why This Is Still MVP

The mobile app is not yet on a fully separate mobile identity stack. It still inherits tenant-user login and tenant JWT issuance.

## Planned Follow-Up

- refresh tokens for mobile sessions
- device registration and device-level revocation
- operator visibility into active mobile devices/sessions
- stronger distinction between driver mobile access and field-operator mobile access
- dedicated mobile permission bundles instead of reusing the broader tenant role map
