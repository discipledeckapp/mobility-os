# Control-Plane Completion Audit

Date: 2026-03-30
Status: Proposed
Purpose: Identify where the control plane is already operationally meaningful, where it is thin, and what remains needed for platform completion.

## 1. Audit Summary

The control plane is further along than the repo narrative has been giving it credit for.

What exists today:

- plans
- subscriptions
- tenant lifecycle
- billing operations
- platform wallets
- feature flags
- platform settings
- staff management
- tenant provisioning
- platform operations oversight

What is still missing or thin:

- deeper support operations tooling
- stronger impersonation/intervention model
- metering as a true operating surface
- richer tenant drill-down workflows
- more complete case-handling posture around disputes, governance, and escalations

The main drift is not “no control plane.”
The main drift is that the current control plane behaves more like an informed oversight console than a full operational intervention system.

## 2. Current Surface Map

| Domain | Backend Capability In `api-control-plane` | Web Surface | Assessment |
|---|---|---|---|
| Plans | present | indirect / supporting | available but not the main gap |
| Subscriptions | strong | present | meaningful registry surface |
| Billing operations | strong | present | one of the stronger platform workbenches |
| Payments | strong | partial | backend real, frontend mostly reflected through billing operations |
| Platform wallets | present | present | meaningful but still focused on oversight |
| Tenant lifecycle | strong | present | meaningful workflow with transition controls |
| Tenants / provisioning | present | present | useful current-state surfaces |
| Operations oversight | present | present | strong oversight summary, thinner intervention tooling |
| Governance | present | present | present but still more surface than complete workflow engine |
| Feature flags | present | present | useful governance surface |
| Platform settings | present | present | structured config surface exists |
| Metering | backend/internal | weak | no meaningful first-class admin operating surface |
| Staff | present | present | adequate baseline |
| Records / evidence | present | partial | visible through billing docs and records endpoints, but not a general ops workbench |

## 3. Domain-By-Domain Notes

### Billing Operations

Current state:
- one of the strongest control-plane surfaces
- invoice registry, dispute registry, and document registry are visible in [page.tsx](/Users/seyiadelaju/mobility-os/apps/control-plane-web/src/app/billing-operations/page.tsx)
- backend support spans invoices, collections, runs, and payments

Assessment:
- materially real platform workflow

Gap:
- deeper case management and cross-linking into tenant intervention workflows

### Tenant Lifecycle

Current state:
- lifecycle registry and governed status transitions are visible in [page.tsx](/Users/seyiadelaju/mobility-os/apps/control-plane-web/src/app/tenant-lifecycle/page.tsx)
- backend lifecycle APIs and internal controls exist

Assessment:
- meaningful workflow already

Gap:
- better connection between lifecycle posture and:
  - support actions
  - billing state
  - feature access
  - operational intervention

### Operations Oversight

Current state:
- strong cross-tenant oversight view in [page.tsx](/Users/seyiadelaju/mobility-os/apps/control-plane-web/src/app/operations/page.tsx)
- backend support is intentionally summary-oriented in [operations.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-control-plane/src/operations/operations.controller.ts)

Assessment:
- useful platform summary surface

Gap:
- stronger support queue behavior
- actionable intervention flows
- deeper tenant incident drill-down

### Governance And Platform Settings

Current state:
- present as explicit platform domains
- important for keeping cross-tenant rules centralized

Assessment:
- strategically correct and architecturally sound

Gap:
- more complete end-to-end governance workflows rather than static or semi-static admin forms

### Metering

Current state:
- backend/internal-only capability
- no meaningful first-class surface in control-plane-web

Assessment:
- genuine platform gap

Gap:
- usage visibility
- plan consumption insight
- admin review of metered events or aggregates

### Tenant And Provisioning Surfaces

Current state:
- tenant registry and detail routes exist
- provisioning capability exists in backend

Assessment:
- useful baseline

Gap:
- deeper operational tenant detail views that unify:
  - lifecycle
  - billing
  - operational attention
  - support history

## 4. Honest Diagnosis

The control plane has not failed to materialize.

It has materialized unevenly:

- strong in lifecycle and billing
- meaningful in oversight
- weaker in support operations depth
- weak in metering visibility
- not yet a full “platform intervention operating system”

That is an important distinction, because the next work should not rebuild what already exists.
It should deepen the platform surfaces that are still too summary-oriented.

## 5. Mission-Critical Completion Targets

### Must-Have

- support operations completion
- tenant intervention drill-down and action model
- metering and usage visibility
- stronger linkage between billing, lifecycle, and operations posture

### Important But Secondary

- richer evidence / records workbench
- deeper governance case handling
- more complete tenant detail command center

## 6. Recommended Work Packages

### Package A: Support And Intervention Ops

Scope:
- support queue model
- tenant incident/intervention detail
- escalation and resolution notes
- platform-safe intervention logging

### Package B: Usage And Metering Visibility

Scope:
- usage summary surface
- subscription consumption visibility
- internal metering posture for staff

### Package C: Tenant Command Center Completion

Scope:
- stronger tenant detail page
- unify lifecycle, billing, operations, and governance signals in one platform workspace

### Package D: Control-Plane Records And Evidence

Scope:
- broader records view beyond current billing-doc emphasis
- cross-link evidence to disputes, lifecycle, and support actions

## 7. Immediate Next Actions

1. Treat billing operations and lifecycle as existing foundations, not blank slates.
2. Scope support operations as the next major control-plane completion effort.
3. Decide the minimum viable metering surface that platform staff actually need.
4. Turn tenant detail into a true command center rather than only a registry drill-down.
