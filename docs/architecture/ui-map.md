# UI Map

Date: 2026-03-30
Status: Current-state summary

This document is a compact UI-facing route map.
For canonical ownership and semantics, see:
- [Canonical Ownership Matrix](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)

## Tenant Web

Current live route groups in `apps/tenant-web`:

- `/`
  - operator dashboard or role-aware redirect
- `/drivers`
  - driver registry, readiness, verification, and detail surfaces
- `/driver-self-service`
  - driver onboarding / recovery
- `/guarantor-self-service`
  - guarantor verification flow
- `/vehicles`
  - vehicle registry, create flow, detail, valuation, and status actions
- `/assignments`
  - assignment registry, detail, create flow, and lifecycle actions
- `/remittance`
  - remittance registry and lifecycle actions
- `/reports`
  - overview, readiness, licence-expiry, and risk-oriented reporting surfaces
- `/business-entities`
  - business hierarchy view
- `/fleets`
  - fleet operations and readiness view
- `/maintenance`
  - maintenance queue
- `/settings`
  - account, organisation, team, notifications, privacy, and preferences
- `/subscription`
  - SaaS plan, invoice, and usage-limit context
- `/wallet`
  - currently used as verification-funding UX
  - this route semantic is under active architecture review and should not be treated as the canonical operational-wallet surface

## Mobile Ops

Current role-aware areas in `apps/mobile-ops`:

- shared auth entry
- driver mode
  - assignments, remittance, profile, verification continuity
- guarantor mode
  - guarantor onboarding and verification continuity
- operator mode
  - dashboard, drivers, vehicles, assignments, remittance, reports, wallet, settings, business entities, fleets, and operating units

## Control-Plane Web

Current live route groups in `apps/control-plane-web`:

- `/`
  - platform dashboard
- `/tenants`
  - tenant registry, provisioning, and detail
- `/subscriptions`
  - subscription registry
- `/billing-operations`
  - invoices, collections, disputes, and billing run actions
- `/platform-wallets`
  - platform-wallet oversight
- `/tenant-lifecycle`
  - lifecycle posture and transitions
- `/feature-flags`
  - feature-flag management
- `/platform-settings`
  - structured platform settings
- `/operations`
  - cross-tenant operational oversight
- `/governance`
  - governance, privacy, and notification posture
- `/intelligence/*`
  - persons, review cases, and intelligence workflows
- `/staff`
  - platform staff management

## Notes

- The old description of tenant-web as only dashboard + drivers + vehicles + assignments + remittance + read-only wallet is no longer accurate.
- Wallet and billing route semantics must be read together with the ownership matrix because current UX naming is part of the drift being corrected.
