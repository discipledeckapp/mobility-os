# Phase 1-2 Execution Backlog

Date: 2026-03-30
Status: Proposed
Depends on:
- [product-intent-recovery-implementation-plan.md](/Users/seyiadelaju/mobility-os/docs/engineering/product-intent-recovery-implementation-plan.md)
- [canonical-ownership-matrix.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-ownership-matrix.md)
- [canonical-access-model.md](/Users/seyiadelaju/mobility-os/docs/architecture/canonical-access-model.md)
- [financial-terminology-decision.md](/Users/seyiadelaju/mobility-os/docs/platform/financial-terminology-decision.md)
- [access-model-stabilization-workplan.md](/Users/seyiadelaju/mobility-os/docs/engineering/access-model-stabilization-workplan.md)
- [operator-workflow-completion-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/operator-workflow-completion-audit.md)
- [control-plane-completion-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/control-plane-completion-audit.md)
- [intelligence-integration-audit.md](/Users/seyiadelaju/mobility-os/docs/engineering/intelligence-integration-audit.md)
- [implementation-readiness-queue.md](/Users/seyiadelaju/mobility-os/docs/engineering/implementation-readiness-queue.md)

This backlog converts the implementation plan into a concrete first execution sequence.

## Phase 1

Goal:
- re-ground the product and eliminate source-of-truth ambiguity before broader implementation continues

### Track 1: Documentation and System Truth

#### Task 1.1

Create a canonical current-state app map.

Deliverables:
- real route inventory for `tenant-web`
- real route inventory for `control-plane-web`
- real navigator map for `mobile-ops`
- real module inventory for:
  - `api-core`
  - `api-control-plane`
  - `api-intelligence`

Why:
- current docs are stale and inconsistent

Status:
- started through `canonical-ownership-matrix.md`

#### Task 1.2

Replace stale summary docs.

Target docs:
- `PROJECT_STATE.md`
- `docs/architecture/ui-map.md`
- `docs/platform/wallet-model.md`
- relevant README implementation-status sections

Required changes:
- remove outdated statements
- reflect current module coverage
- reflect current mobile-ops status
- reflect current tenant-web route reality

Why:
- the repo cannot keep sending conflicting signals to future implementation work

#### Task 1.3

Approve canonical financial terminology.

Decision package:
- operational wallet
- verification funding
- subscription billing
- platform wallet

Expected output:
- one glossary section
- one route and nav recommendation
- one consistent wording set for product copy

Why:
- wallet ambiguity is currently one of the biggest drift vectors

Status:
- proposed in `financial-terminology-decision.md`

### Track 2: Access Model Stabilization

#### Task 2.1

Map the canonical access model across all user types.

User types:
- operator/admin
- driver mobile
- driver self-service
- guarantor self-service
- platform staff

For each:
- auth entry
- session source
- routing destination
- shell/layout owner
- allowed navigation set

Why:
- access bugs corrupt all workflow testing and UX confidence

Status:
- proposed in `canonical-access-model.md`

#### Task 2.2

Audit and align post-login routing contracts.

Surfaces:
- `tenant-web`
- `mobile-ops`
- auth reset and invite return flows
- self-service continuation flows

Target:
- every role lands in the correct shell every time

Reference:
- `access-model-stabilization-workplan.md`

#### Task 2.3

Define the long-term mobile role-entry model.

Question:
- should the explicit mobile role-selection screen remain a UX convenience, or be removed once session-derived routing is sufficient?

Required output:
- product decision
- technical direction

### Phase 1 Exit Criteria

- canonical ownership matrix approved
- stale docs corrected
- wallet terminology decision approved
- canonical access model documented
- role-routing stability issues triaged into implementation-ready tasks

## Phase 2

Goal:
- complete the operator mission-critical workflows and remove the biggest product dead ends

### Track 3: Core Operator Workflow Completion

Reference:
- `operator-workflow-completion-audit.md`

#### Task 3.1

Operating-unit workflow completion.

Current issue:
- route presence exists, but the business hierarchy flow is not yet clearly complete as a coherent operator workflow

Scope:
- registry
- create/edit/detail
- links to business entities and fleets
- hierarchy-aware actions

#### Task 3.2

Maintenance workflow completion.

Current issue:
- backend work orders exist, but tenant UX is mostly a queue/report view

Scope:
- work-order creation
- work-order detail/history
- state transitions
- relationship to vehicle lifecycle and readiness

#### Task 3.3

Inspection workflow completion.

Current issue:
- backend support exists, but inspection must be part of readiness and operator action loops, not just a hidden service capability

Scope:
- inspection scheduling / recording
- compliance posture
- action links from reports

#### Task 3.4

Document operations completion.

Current issue:
- documents affect readiness heavily, but document workflows are fragmented across driver and vehicle experiences

Scope:
- operator document views
- upload/review flows
- clear document requirement presentation
- route-level and command-center consistency

#### Task 3.5

Audit visibility surface.

Current issue:
- audit records are being written in backend modules, but operators do not yet have a coherent audit viewing surface

Scope:
- audit registry
- entity-linked audit slices
- operator-safe visibility model

### Track 4: Financial Model Clarification

#### Task 4.1

Decide and execute `/wallet` route semantics.

Options:
- keep `/wallet` as verification funding and create a new route for operational wallet
- restore `/wallet` to operational wallet and move verification funding elsewhere

Required output:
- approved IA decision
- route migration plan
- content and nav changes

#### Task 4.2

Create separate operator-facing surfaces for:
- operational wallet
- verification funding
- subscription/billing

Minimum requirement:
- users must understand what each surface is for without reading docs

#### Task 4.3

Align payment-return and funding flows with chosen IA.

Current issue:
- payment flows are technically wired, but semantically mixed into the wrong conceptual area

### Track 5: Trust Pipeline Completion

#### Task 5.1

Driver onboarding continuity review.

Scope:
- invite
- OTP
- account setup
- self-service resume
- readiness
- verification funding gate
- assignment-readiness outcome

#### Task 5.2

Guarantor onboarding continuity review.

Scope:
- invite and OTP
- guarantor self-service account
- verification flow
- relationship back to driver readiness and operator visibility

#### Task 5.3

Licence verification and review UX completion.

Scope:
- failed review states
- re-verification requests
- operator actionability
- support visibility

### Phase 2 Exit Criteria

- operator hierarchy flow is complete enough for daily use
- maintenance and inspection are real workflows, not just queues
- documents and audit become visible operator systems
- financial surfaces are semantically separated
- driver and guarantor trust pipeline is understandable and recoverable

## Sequencing

### Sequence A

Must happen first:
- Task 1.2
- Task 1.3
- Task 2.1
- Task 2.2

### Sequence B

Can begin once product truth is locked:
- Task 4.1
- Task 3.1
- Task 3.2
- Task 5.1

### Sequence C

Follows once route semantics and workflow ownership are settled:
- Task 3.3
- Task 3.4
- Task 3.5
- Task 4.2
- Task 4.3
- Task 5.2
- Task 5.3

## Suggested Working Order For Immediate Execution

1. Update stale docs that contradict reality.
2. Decide wallet and billing IA.
3. Lock the canonical role/access model.
4. Complete maintenance + operating-unit workflow gaps.
5. Separate financial surfaces in tenant-web.
6. Harden driver and guarantor continuity flows.

## Notes

- This backlog intentionally focuses on Phases 1 and 2 only.
- Mobile parity, control-plane completion, and intelligence actionability should begin after these foundations are stable enough to prevent more drift.
