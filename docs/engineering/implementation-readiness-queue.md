# Implementation Readiness Queue

Date: 2026-03-30
Status: Proposed
Purpose: Turn the recovery work into a consolidated execution queue ordered up to the edge of implementation.

## 1. P0: Foundation And Semantics

### 1. Source-Of-Truth Recovery

Goal:
- keep docs, route semantics, ownership, and terminology aligned

Ready artifacts:
- [product-intent-recovery-implementation-plan.md](/Users/seyiadelaju/mobility-os/docs/engineering/product-intent-recovery-implementation-plan.md)
- [canonical-ownership-matrix.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [financial-terminology-decision.md](/Users/seyiadelaju/mobility-os/docs/platform/financial-terminology-decision.md)

Implementation readiness:
- ready for targeted doc cleanup and route/copy alignment work

### 2. Access Model Stabilization

Goal:
- eliminate role-routing drift across tenant-web and mobile-ops

Ready artifacts:
- [access-model-stabilization-workplan.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-model-stabilization-workplan.md)
- [access-route-decision-table.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-route-decision-table.md)
- [role-routing-audit-and-checklist.md](/Users/seyiadelaju/mobility-os/docs/engineering/role-routing-audit-and-checklist.md)

Implementation readiness:
- ready for a focused implementation pass on:
  - shared session precedence helpers
  - tenant-web route/layout audit
  - mobile bootstrap cleanup

### 3. Financial Semantics Clarification

Goal:
- separate operational wallet, verification funding, subscription billing, and platform wallet

Ready artifacts:
- [financial-terminology-decision.md](/Users/seyiadelaju/mobility-os/docs/platform/financial-terminology-decision.md)
- [subscription-payment-method-separation-plan.md](/Users/seyiadelaju/mobility-os/docs/engineering/subscription-payment-method-separation-plan.md)

Implementation readiness:
- ready for IA and route decision work before UI refactors
- ready for billing-payment-method separation work

## 2. P1: Operator Product Completion

### 4. Operator Workflow Completion

Goal:
- complete mission-critical operator workflows without rebuilding already-strong domains

Ready artifacts:
- [operator-workflow-completion-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/operator-workflow-completion-audit.md)

Implementation packages:
- hierarchy completion
- maintenance and inspection operations
- audit visibility
- operational finance surface clarification

Implementation readiness:
- ready for package-level scoping and tickets

### 5. Driver / Guarantor Trust Pipeline Hardening

Goal:
- make onboarding, verification, readiness, and continuation robust

Existing foundations:
- access model artifacts
- tenant-driver alignment audit

Implementation readiness:
- ready for continuity and recovery hardening once access model work begins

## 3. P2: Platform And Intelligence Completion

### 6. Control-Plane Completion

Goal:
- deepen platform staff tooling from oversight console into intervention system

Ready artifacts:
- [control-plane-completion-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/control-plane-completion-audit.md)

Implementation packages:
- support and intervention ops
- metering visibility
- tenant command center completion
- records/evidence workbench

Implementation readiness:
- ready for scoped design and ticket breakdown

### 7. Intelligence Actionability

Goal:
- turn intelligence from backend capability into operational leverage

Ready artifacts:
- [intelligence-integration-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/intelligence-integration-audit.md)

Implementation packages:
- review ops completion
- risk and watchlist operations
- intelligence-to-operations loop
- person and linkage workbench

Implementation readiness:
- ready for staff-workflow and tenant-output scoping

## 4. Recommended Execution Sequence

### Wave 1

- access model stabilization
- financial semantics clarification
- source-of-truth cleanup completion

### Wave 2

- operator workflow completion:
  - operating units
  - maintenance
  - inspections
  - audit visibility

### Wave 3

- trust pipeline hardening
- wallet/verification/subscription IA execution
- subscription payment method separation
- mobile-first parity cleanup

### Wave 4

- control-plane support/intervention completion
- intelligence actionability
- metering visibility

## 5. Ready-To-Implement First Packages

If implementation starts immediately, the cleanest first packages are:

1. Access Model Stabilization
2. Wallet / Verification Funding IA decision and route alignment
3. Operating Units + Maintenance/Inspection completion package

These are the highest-leverage packages because they reduce drift and unblock the rest of the product map.

## 6. What Is Intentionally Not Yet Being Implemented

- broad redesigns
- auth stack replacement
- large cross-plane refactors
- speculative event architecture

Those should wait until the current product semantics and workflow boundaries are locked.
