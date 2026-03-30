# Access Model Stabilization Workplan

Date: 2026-03-30
Status: Proposed
Depends on:
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [tenant-driver-access-alignment-2026-03-26.md](/Users/seyiadelaju/mobility-os/docs/architecture/tenant-driver-access-alignment-2026-03-26.md)
- [phase-1-2-execution-backlog.md](/Users/seyiadelaju/mobility-os/docs/engineering/phase-1-2-execution-backlog.md)
- [access-route-decision-table.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-route-decision-table.md)
- [role-routing-audit-and-checklist.md](/Users/seyiadelaju/mobility-os/docs/engineering/role-routing-audit-and-checklist.md)

## 1. Objective

Make role resolution, shell selection, and continuation routing deterministic across:

- tenant-web
- mobile-ops
- invite flows
- password reset return flows
- saved sessions
- self-service deep links

## 2. Current Problem Statement

The repo already contains multiple real access experiences, but they are not yet enforced as one explicit contract.

That creates three classes of failure:

1. operator-shell leakage
   - driver or guarantor users can fall into the tenant/admin shell if a route defaults to `/`
2. self-service ambiguity
   - driver mobile and driver self-service continuity are close enough to be confused
3. mobile entry drift
   - mobile role selection still acts like a decision point even though the session should be the real source of truth

## 3. Success Criteria

The workstream is complete when:

- every tenant-web login lands in the correct shell or continuation route
- every saved tenant-web session revisiting `/` lands in the correct shell or continuation route
- password reset does not collapse self-service users into the operator shell
- invite and deep-link flows preserve driver vs guarantor context
- mobile-ops navigator selection is derived from session and continuation state first
- driver mobile and driver self-service paths are testable as separate experiences

## 4. Scope

### In Scope

- tenant-web login redirect logic
- tenant-web middleware redirect logic
- tenant-web root route shell selection
- tenant-web protected layout and route-group review
- mobile-ops navigator selection
- mobile-ops auth bootstrap and continuation logic
- invite / OTP / reset return contracts
- documentation of canonical session precedence

### Out Of Scope

- broad auth provider replacement
- full redesign of self-service UX
- control-plane auth changes
- major API auth stack replacement

## 5. Implementation Tracks

### Track A: Tenant-Web Role Routing Audit

Goal:
- remove all paths that can place driver or guarantor users inside the operator shell by default

Tasks:
- review `/login` action redirect precedence
- review middleware redirect precedence
- review `/` route behavior
- review protected route groups and layout wrappers
- review self-service route exemptions

Target outcome:
- tenant-web has one consistent role-aware redirect contract

### Track B: Session Contract Hardening

Goal:
- ensure all role-routing decisions use the same trusted fields and precedence

Tasks:
- standardize use of:
  - `selfServiceSubjectType`
  - `accessMode`
  - `mobileRole`
  - `linkedDriverId`
  - `selfServiceDriverId`
- confirm precedence order is identical in:
  - login redirects
  - middleware
  - root route handling
  - mobile bootstrap

Target outcome:
- session interpretation is centralized and reproducible

### Track C: Mobile-Ops Experience Separation

Goal:
- make driver mobile, driver self-service, guarantor self-service, and operator mode feel intentionally separate

Tasks:
- review `RootNavigator` route precedence
- document what the role-selection screen is still responsible for
- determine whether role selection remains:
  - temporary onboarding UX only
  - or a long-term product requirement
- tighten the conceptual split between:
  - driver mobile home
  - driver self-service continuation

Target outcome:
- mobile app entry is session-led, not role-picker-led

### Track D: Special-Case Continuity Hardening

Goal:
- make invite, reset, and deep-link flows preserve role context reliably

Tasks:
- audit driver invite -> OTP -> continuation
- audit guarantor invite -> OTP -> continuation
- audit password reset -> login -> post-login redirect
- audit saved-session revisit to `/`
- audit deep links into self-service and protected operator routes

Target outcome:
- access context survives non-happy-path journeys

## 6. Recommended Sequence

### Step 1

Document the canonical session precedence and routing rules.

Status:
- started in `canonical-access-model.md`

### Step 2

Complete a route-by-route tenant-web access audit.

Focus:
- `/`
- `/login`
- self-service routes
- protected route groups
- route-level layouts

### Step 3

Complete a navigator-by-navigator mobile-ops access audit.

Focus:
- auth bootstrap
- initial route calculation
- self-service continuation
- operator mode separation

### Step 4

Create an implementation task list grouped by:
- immediate bug fixes
- structural cleanup
- long-term auth/product decisions

### Step 5

Define regression coverage requirements.

Minimum coverage:
- driver login
- guarantor login
- operator login
- saved-session revisit
- password reset return
- invite/deep-link return

## 7. Recommended Execution Deliverables

### Deliverable 1

Canonical route and shell decision table.

### Deliverable 2

Implementation checklist for tenant-web.

### Deliverable 3

Implementation checklist for mobile-ops.

### Deliverable 4

Regression matrix for role-aware routing.

## 8. Risks

- legacy accounts may blur operator and driver-mobile semantics
- mobile role-selection UX may currently hide structural ambiguity rather than solve it
- route-level layouts may still leak operator chrome around self-service flows
- session-derived routing can still regress if helpers are duplicated instead of centralized

## 9. Immediate Next Actions

1. Inventory tenant-web route groups and layouts that participate in access gating.
2. Inventory mobile-ops bootstrap and navigator decision points.
3. Produce the route and shell decision table.
4. Translate the findings into implementation tickets before making broad auth changes.
