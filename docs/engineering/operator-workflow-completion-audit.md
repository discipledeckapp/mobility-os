# Operator Workflow Completion Audit

Date: 2026-03-30
Status: Proposed
Purpose: Map the current operator workflow surface against the underlying tenant-plane capability so Phase 2 work can target the real gaps.

## 1. Audit Summary

The tenant plane is not missing core capability wholesale.

What is actually happening is:

- `api-core` has broader operator capability than tenant-web exposes as first-class workflows
- some workflows are fully represented in tenant-web
- some are embedded inside detail pages but not elevated into full operator command centers
- some exist mainly as backend capability with only a thin UI slice

That means the next implementation phase should distinguish between:

1. workflow already implemented but under-surfaced
2. workflow partially surfaced and needing completion
3. workflow materially missing as a product surface

## 2. Current Operator Surface Map

| Workflow Domain | Backend Capability In `api-core` | Tenant-Web Surface | Current Assessment |
|---|---|---|---|
| Drivers | strong | strong | one of the most complete modules |
| Vehicles | strong | strong | strong registry + detail workflow |
| Assignments | strong | strong | operationally meaningful |
| Remittance | strong | strong | operationally meaningful |
| Business entities | present | present | useful but still dashboard-style rather than full lifecycle system |
| Fleets | present | present | useful but still dashboard-style rather than full lifecycle system |
| Operating units | present | partial | create/edit entry exists, but no mature top-level registry/detail command center |
| Maintenance | strong | thin | backend work orders exist; tenant-web top-level page is mostly a queue |
| Inspections | strong | partial/embedded | available inside vehicle workflows, but no dedicated operator inspection command center |
| Driver documents | strong | strong/embedded | robust inside driver detail and self-service flows |
| Vehicle documents | settings/config only, limited visible workflow | weak | no clear vehicle-document command center |
| Audit visibility | audit service exists | weak | no coherent operator audit registry surface |
| Operational wallet | backend exists | weak/misaligned | no real operator wallet surface in tenant-web today |
| Verification funding | tenant billing summary exists | strong | current `/wallet` experience is really this |
| Reports / readiness | present | present | strong summary layer, but not always action-complete |
| Team / permissions | present | present in settings | adequate but still nested in settings rather than a fuller admin workflow |

## 3. Domain-By-Domain Notes

### Drivers

Current state:
- strongest and clearest operator module
- registry, detail, readiness, documents, review, and self-service linkage are all visible

Assessment:
- good benchmark for UX and workflow completeness
- should be treated as the operator workflow standard

### Vehicles

Current state:
- vehicle registry is strong
- vehicle detail already includes:
  - maintenance context
  - inspection context
  - assignment context
  - status transitions

Assessment:
- stronger than it first appears
- vehicle detail is already functioning as a multi-domain command center

Gap:
- some adjacent domains remain buried inside vehicle detail instead of having their own broader workflow surfaces

### Business Entities and Fleets

Current state:
- both pages are operational dashboards with meaningful rollups and drill-in value
- they are not empty or fake

Assessment:
- these are useful current-state modules
- but they still feel more like analytics-informed overview pages than full lifecycle management systems

Gap:
- stronger create/edit/detail continuity
- clearer hierarchy administration
- tighter operating-unit integration

### Operating Units

Current state:
- backend capability exists
- tenant-web has create/edit entry points
- no mature top-level operator-facing operating-unit registry page is present

Assessment:
- genuine workflow gap

Priority:
- high, because hierarchy management is central to operator structure

### Maintenance

Current state:
- `api-core` exposes real work-order endpoints in [maintenance.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/maintenance/maintenance.controller.ts)
- tenant-web top-level maintenance page in [page.tsx](/Users/seyiadelaju/mobility-os/apps/tenant-web/src/app/maintenance/page.tsx) is mainly a queue view based on readiness state
- vehicle detail contains richer maintenance context and actions than the top-level maintenance page does

Assessment:
- backend-strong, product-surface-thin

Gap:
- maintenance needs a real operator workflow surface:
  - work-order creation
  - work-order detail/history
  - transitions
  - vendor/cost visibility

### Inspections

Current state:
- `api-core` exposes start, submit, review, and list endpoints in [inspections.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/inspections/inspections.controller.ts)
- tenant-web does not have a dedicated inspections route
- inspection actions and history currently live mostly inside vehicle detail flows

Assessment:
- capability exists, but product visibility is too buried

Gap:
- dedicated inspection queue/registry
- compliance-focused operator view
- clearer relationship to readiness and maintenance scheduling

### Documents

Current state:
- driver document workflows are substantial in tenant-web:
  - self-service upload
  - operator review
  - preview/content routes
  - readiness integration
- vehicle document requirements exist in settings semantics, but the operator-facing vehicle document workflow is not equally mature

Assessment:
- document operations are strong for drivers, weaker for vehicles and broader record/document operations

Gap:
- clearer vehicle document workflow
- broader document command center only if needed after driver/vehicle parity is reached

### Audit

Current state:
- audit infrastructure exists in backend module form
- no clear operator audit registry route exists in tenant-web

Assessment:
- backend support without a product-complete operator surface

Gap:
- audit registry
- entity-linked audit slices
- safe operator-facing event history

### Operational Wallet

Current state:
- operational wallet endpoints exist in [operational-wallets.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-core/src/operational-wallets/operational-wallets.controller.ts)
- tenant-web currently has no genuine operational wallet surface
- `/wallet` has drifted into verification funding instead

Assessment:
- strong semantic and workflow gap

Gap:
- decide whether operational wallet is mission-critical now or can remain a later Phase 2/3 surface

### Verification Funding

Current state:
- tenant-web `/wallet` already functions as a verification funding surface
- this is productively useful, but semantically mislocated

Assessment:
- not missing, but mislabeled in IA

### Reports / Readiness

Current state:
- reporting is richer than “just charts”
- readiness reports are already action-oriented in several places

Assessment:
- relatively strong support layer

Gap:
- continue wiring reports into direct workflow actions instead of isolated summaries

## 4. Honest Diagnosis

The repo has not failed to build the operator product.

It has drifted into an uneven shape where:

- a few domains are highly mature
- a few domains are strong but hidden inside other pages
- a few domains have real backend capability but weak first-class operator surfaces
- the information architecture does not always reveal what the system can actually do

That is better than “missing everything,” but it is also risky because users experience the product through the surface, not the module inventory.

## 5. Mission-Critical Completion Targets

### Must-Have In Phase 2

- operating-unit workflow completion
- maintenance workflow completion
- inspection workflow elevation
- operational wallet / verification funding semantic resolution
- operator audit visibility

### Important But Can Follow Slightly After

- stronger business-entity and fleet lifecycle continuity
- vehicle-document parity with driver-document workflows
- team/admin workflow refinement beyond settings nesting

## 6. Recommended Work Packages

### Package A: Hierarchy Completion

Scope:
- operating units registry/detail
- tighter business entity -> operating unit -> fleet continuity

### Package B: Maintenance And Inspection Operations

Scope:
- top-level maintenance command center
- inspections queue and review workflow
- stronger connection back to vehicle detail and readiness reports

### Package C: Operational Finance Surface Clarification

Scope:
- decide `/wallet` semantics
- expose operational wallet intentionally or defer it explicitly
- keep verification funding but move it under the right product language

### Package D: Audit And Records Visibility

Scope:
- operator audit registry
- entity-linked audit views
- review-safe chronology for actions that affect readiness, assignments, remittance, and vehicle status

## 7. Immediate Next Actions

1. Approve the distinction between:
   - under-surfaced existing capability
   - partially implemented workflows
   - genuinely missing operator workflows
2. Use that distinction to break Phase 2 into:
   - hierarchy
   - maintenance/inspection
   - financial semantics
   - audit visibility
3. Avoid treating every gap as a greenfield build; some are surfacing and IA problems more than backend problems.
