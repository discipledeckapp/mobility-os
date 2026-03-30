# Product Intent Recovery Implementation Plan

Date: 2026-03-30
Status: Proposed
Scope: Mobility OS / Mobiris monorepo

## 1. Executive Summary

Mobiris is supposed to be a purpose-built operating system for African vehicle-for-hire operators, not a generic fleet dashboard.
Its mission-critical product promise is:

- verify who is driving
- control which driver is in which vehicle
- enforce remittance accountability
- preserve operational auditability
- surface cross-operator identity and fraud risk safely
- separate tenant operations from SaaS governance and intelligence workflows

The repo still reflects that ambition, but the implementation has drifted in four ways:

1. product semantics have drifted
   - example: `wallet` now means verification funding in tenant-web, while docs still describe it as the operational wallet surface
2. docs are stale relative to code
   - several repo-level docs understate what exists today and overstate what is coherent
3. workflow coverage is uneven
   - some domains are rich and operational, others exist only as thin pages or backend-only capability
4. mobile-first intent is accepted in architecture but not yet fully realized in delivery sequencing

This plan turns the recovery and gap analysis into a concrete implementation roadmap.

Companion documents created from this plan:

- [canonical-ownership-matrix.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [financial-terminology-decision.md](/Users/seyiadelaju/mobility-os/docs/platform/financial-terminology-decision.md)
- [phase-1-2-execution-backlog.md](/Users/seyiadelaju/mobility-os/docs/engineering/phase-1-2-execution-backlog.md)

## 2. Product Intent

The intended product model is a three-plane architecture:

- Tenant operations plane
  - daily operator workflows
  - drivers, vehicles, assignments, remittance, maintenance, documents, readiness, operational finance
- Control plane
  - subscriptions, lifecycle, billing, governance, platform wallets, support operations, feature flags, metering
- Intelligence plane
  - canonical person graph, liveness, identity resolution, review cases, watchlists, cross-tenant risk signals

The intended user roles are:

- tenant operators and finance/admin users
- drivers
- guarantors
- platform support / billing / admin staff
- intelligence reviewers

The intended customer is mobile-first vehicle-for-hire operators running cash-heavy, trust-sensitive fleets.

## 3. Current Reality

### Working well enough today

- `api-core` has broad operational coverage across hierarchy, drivers, vehicles, assignments, remittance, notifications, privacy, policy, reports, mobile-ops, tenant-billing, records, inspections, and maintenance.
- `tenant-web` has live coverage for more domains than the old docs suggest, including business entities, fleets, settings, reports, subscription, driver self-service, and guarantor self-service.
- `mobile-ops` is already a multi-role app with driver, guarantor, and operator experiences.
- `api-control-plane` is materially ahead of its README, with live modules for billing, payments, platform wallets, metering, lifecycle, governance, operations, provisioning, and staff.
- `api-intelligence` is materially ahead of its README, with matching, watchlists, review cases, linkage events, and providers in addition to persons, identifiers, biometrics, and risk.

### Partial or weak areas

- tenant-web feature architecture is weak; most feature folders are empty while route-level files carry the real implementation
- maintenance, inspections, audit, documents, accounting, and some hierarchy flows are not yet product-complete in tenant-web
- support operations exist as oversight surfaces more than real ticketing / impersonation / intervention workflows
- metering exists mostly as backend/internal capability, not as an admin operating surface
- intelligence is technically stronger than its current operator-facing and support-facing action loops

### Clear drift

- docs and runtime reality disagree
- route semantics and product terminology disagree
- mobile-first strategy exists in ADRs but is not yet the dominant execution model
- some implementation choices now look reactive instead of blueprint-driven

## 4. Delivery Principles

Implementation from this point must follow these principles:

1. recover one canonical source of truth before expanding scope
2. fix semantics and information architecture before adding more UI surface area
3. complete operator mission-critical workflows before second-order platform polish
4. keep plane boundaries intact
5. treat mobile-first operator usage as a product requirement, not a future enhancement
6. turn intelligence outputs into actions, not just metadata

## 5. Priority Framework

### A. Mission-Critical Must-Haves

- role-safe access and shell routing across operator, driver, and guarantor experiences
- coherent financial model and IA for:
  - operational wallet
  - verification funding
  - SaaS billing
- complete operator core workflows:
  - business hierarchy
  - drivers
  - vehicles
  - assignments
  - remittance
  - maintenance
  - inspections
  - documents
  - audit visibility
- robust driver and guarantor onboarding / verification / readiness lifecycle
- mobile parity for actual daily operator workflows

### B. Important but Secondary

- control-plane support operations completion
- metering and usage visibility
- stronger reporting and readiness action surfaces
- clearer commercial UX for plan limits, invoices, and verification funding
- better eventing and workflow automation

### C. Nice-to-Have / Future Work

- investor workflows
- deeper accounting and journal flows
- richer enterprise analytics
- advanced partner integrations
- larger-scale workflow automation

## 6. Workstreams

### Workstream 1: Source-of-Truth Recovery

Objective:
- align docs, architecture map, product naming, route semantics, and module ownership

Current problem:
- the repo has no single trustworthy product/system map

Target outcome:
- one canonical description of what exists, what is intended, and what each app owns

Scope:
- update stale root/docs references
- create canonical app and route map
- reconcile tenant-web IA terms with actual financial models
- document actual mobile-ops role model

Dependencies:
- none

Priority:
- P0

Recommended sequence:
- first

Definition of done:
- engineering, product, and design can describe the same system in the same terms

### Workstream 2: Access Model Stabilization

Objective:
- make role resolution, post-login routing, and role-specific experience selection durable

Current problem:
- operator, driver, guarantor, self-service, and mobile roles are easy to conflate

Target outcome:
- every session lands in the correct shell and stays there across login, refresh, reset, invite, and deep-link flows

Scope:
- tenant-web routing and layout selection
- mobile-ops navigator selection
- shared auth/session helpers
- invite and continuation flow consistency
- guard and role contract review

Dependencies:
- Workstream 1

Priority:
- P0

Recommended sequence:
- first

Definition of done:
- role-aware access is deterministic across web and mobile

### Workstream 3: Operator Core Workflow Completion

Objective:
- complete the real operator operating system rather than just the strongest slices

Current problem:
- some operator flows are rich, but others are thin, partial, or backend-only

Target outcome:
- no mission-critical operator workflow ends in a dead page, missing action, or backend-only capability

Scope:
- operating units
- maintenance work orders
- inspections
- documents
- audit viewer
- business hierarchy continuity
- action-oriented readiness surfaces

Dependencies:
- Workstreams 1 and 2

Priority:
- P0

Recommended sequence:
- second

Definition of done:
- operators can run day-to-day operations without falling off the product map

### Workstream 4: Financial Model Clarification

Objective:
- restore clear product and UX separation between operational finance, verification funding, and SaaS billing

Current problem:
- architecture separation exists, but the user-facing product model is muddy

Target outcome:
- users understand:
  - what is operational wallet
  - what is verification funding
  - what is subscription billing

Scope:
- route and navigation restructuring
- naming and page title cleanup
- wallet/billing information architecture
- docs and help text alignment
- shared backend contract review

Dependencies:
- Workstream 1

Priority:
- P0

Recommended sequence:
- second

Definition of done:
- no route or module uses overloaded wallet terminology

### Workstream 5: Driver and Guarantor Trust Pipeline

Objective:
- make onboarding, verification, readiness, and accountability feel like one intentional system

Current problem:
- the trust pipeline is powerful but operationally complex and easy to break at UX seams

Target outcome:
- driver and guarantor onboarding is resilient, understandable, and supportable

Scope:
- self-service continuity
- guarantor verification
- readiness messaging
- licence verification and review path
- verification funding interactions
- onboarding notification loops

Dependencies:
- Workstreams 2 and 4

Priority:
- P0/P1 boundary

Recommended sequence:
- second

Definition of done:
- onboarding and readiness are comprehensible to operators, drivers, guarantors, and support staff

### Workstream 6: Mobile-First Operator Completion

Objective:
- fulfill ADR-013 in practice

Current problem:
- mobile-ops is substantial, but not yet clearly the primary operator product surface

Target outcome:
- operators can manage daily fleet workflows from mobile without relying on tenant-web for basic throughput

Scope:
- operator parity audit
- fill missing operator mobile flows
- reduce role-selection friction
- improve offline/resume semantics
- align mobile IA with tenant-web

Dependencies:
- Workstreams 2, 3, and 5

Priority:
- P1

Recommended sequence:
- third

Definition of done:
- mobile-ops is viable as the primary daily operator surface

### Workstream 7: Control-Plane Completion

Objective:
- convert the control plane from strong monitoring/admin groundwork into a full platform operations console

Current problem:
- dashboards and billing exist, but support operations are still incomplete

Target outcome:
- platform staff can govern tenants, billing, lifecycle, support, and intervention end to end

Scope:
- support/ticketing
- impersonation workflows and audit
- metering/usage dashboard
- billing ops refinement
- lifecycle intervention tooling

Dependencies:
- Workstreams 1 and 4

Priority:
- P1

Recommended sequence:
- third

Definition of done:
- platform operations can be run without jumping between raw data and partial dashboards

### Workstream 8: Intelligence Actionability

Objective:
- make the intelligence plane visibly useful in operator and platform decision-making

Current problem:
- intelligence capability is ahead of the action loops built on top of it

Target outcome:
- risk, duplicate identity, watchlists, and review cases clearly influence onboarding, readiness, support, and adjudication

Scope:
- operator-safe intelligence surfacing
- support review queue integration
- watchlist workflow completion
- review-case completion
- stronger cross-plane action contracts

Dependencies:
- Workstreams 5 and 7

Priority:
- P1/P2 boundary

Recommended sequence:
- fourth

Definition of done:
- intelligence output is operationally actionable, not just technically available

## 7. Phased Roadmap

### Phase 1: Re-ground the Product

Primary goal:
- restore one coherent product/system truth

Includes:
- Workstream 1
- Workstream 2
- IA decision for wallet/billing terminology from Workstream 4

Deliverables:
- canonical system map
- canonical route and ownership map
- canonical access model
- approved wallet/billing vocabulary

### Phase 2: Stabilize Core Operator Workflows

Primary goal:
- complete the minimum operating system for transport operators

Includes:
- Workstream 3
- Workstream 4
- Workstream 5

Deliverables:
- completed tenant-web core workflow coverage
- coherent financial model in UX
- hardened driver/guarantor onboarding and verification

### Phase 3: Deliver Mobile-First Operator Reality

Primary goal:
- turn mobile-ops into the actual primary daily operator client

Includes:
- Workstream 6

Deliverables:
- mobile parity for core operator loops
- reduced reliance on tenant-web for daily work

### Phase 4: Finish Platform and Intelligence Operations

Primary goal:
- make governance, support, and intelligence operationally complete

Includes:
- Workstream 7
- Workstream 8

Deliverables:
- mature control-plane operations
- actionable intelligence review and watchlist workflows

## 8. Immediate Start Plan

The work should begin immediately, but not as random implementation.
The correct first execution slice is:

### Immediate Task 1

Create the canonical product/system map.

This includes:
- current route inventory by app
- current module inventory by backend
- product ownership matrix
- terminology reconciliation for wallet and billing concepts
- docs update plan

Reason:
- every other workstream depends on this being stable

### Immediate Task 2

Stabilize the role/access model.

This includes:
- tenant-web role-aware shell routing
- mobile-ops role-entry and session routing review
- invite / resume / password-reset continuity review
- shared auth helper contract cleanup

Reason:
- access bugs create incorrect product experiences and contaminate all workflow testing

### Immediate Task 3

Run the operator core workflow completion audit as an implementation backlog.

This includes:
- operating units
- maintenance
- inspections
- documents
- audit
- wallet/billing UX alignment

Reason:
- this is where product credibility is won or lost

## 9. Risks

- semantic drift risk
  - if terminology stays inconsistent, product complexity will grow faster than implementation quality
- delivery drift risk
  - if new UI/pages are added before source-of-truth recovery, the app will become harder to reason about
- mobile strategy risk
  - if mobile-first remains aspirational instead of operational, the product may miss its actual usage context
- workflow trust risk
  - driver/guarantor/operator access bugs directly undermine the product’s accountability promise
- financial confusion risk
  - wallet, billing, and verification funding confusion will create support burden and poor operator trust

## 10. Open Questions

- Should verification funding remain under `/wallet`, or become its own product area?
- Is tenant-web still the reference operator implementation, or is mobile-ops now the primary implementation target?
- What is the minimum acceptable support operations workflow for the control plane in the next phase?
- Which operator workflows are mandatory on mobile before Phase 3 can be considered complete?

## 11. Success Criteria

This implementation plan succeeds when:

- the product can be described consistently by docs, routes, and module ownership
- operators can complete core workflows without dead ends
- drivers and guarantors always land in correct role experiences
- platform staff can manage billing, lifecycle, governance, and support coherently
- intelligence outputs lead to visible operational and review actions
- mobile-ops aligns with the actual daily usage of the target ICP
