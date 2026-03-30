# Intelligence Integration Audit

Date: 2026-03-30
Status: Proposed
Purpose: Assess how much of the intelligence plane exists today and where the product still underuses it operationally.

## 1. Audit Summary

The intelligence plane is not hypothetical anymore.

It already includes:

- persons
- identifiers
- biometrics
- matching
- review cases
- watchlists
- risk signals
- linkage events
- provider integrations

The biggest gap is not backend existence.
The biggest gap is actionability:

- how intelligence outcomes affect tenant workflows
- how platform staff investigate and resolve cases
- how review results feed back into operator trust decisions safely

## 2. Current Surface Map

| Domain | Backend Capability In `api-intelligence` | Main Surface | Assessment |
|---|---|---|---|
| Canonical persons | strong | present | good baseline search surface |
| Matching | strong | partial | backend real, frontend mostly implied through persons/review work |
| Review cases | strong | present | meaningful registry surface |
| Watchlists | strong | weak/implicit | limited visible dedicated UI in current control-plane routes |
| Risk signals | strong | weak/implicit | not surfaced enough as an operating workflow |
| Linkage events | present | weak | backend capability with limited visible workbench |
| Providers | present | mostly internal | important operationally, thin in UI |

## 3. Domain-By-Domain Notes

### Persons

Current state:
- search and registry flow exists in [page.tsx](/Users/seyiadelaju/mobility-os/apps/control-plane-web/src/app/intelligence/persons/page.tsx)
- backend person query and staff/internal endpoints exist

Assessment:
- good base surface for canonical person search

Gap:
- richer person detail and operator-impact context

### Review Cases

Current state:
- meaningful review case surface exists in [page.tsx](/Users/seyiadelaju/mobility-os/apps/control-plane-web/src/app/intelligence/review-cases/page.tsx)
- backend workflows for create, list, update status, and resolve exist in [review-cases.controller.ts](/Users/seyiadelaju/mobility-os/apps/api-intelligence/src/review-cases/review-cases.controller.ts)

Assessment:
- one of the more real intelligence workflows

Gap:
- stronger evidence navigation
- more explicit routing from case resolution to downstream action

### Watchlists And Risk

Current state:
- backend support exists
- current web surface is not as visible or complete as persons/review cases

Assessment:
- real capability, under-surfaced product value

Gap:
- dedicated watchlist and risk operations surfaces
- clearer case generation and review linkage

### Matching And Linkage

Current state:
- backend is strong
- visible staff workflows are still limited

Assessment:
- intelligence core exists, but the operational story is incomplete

Gap:
- better investigation tooling
- clearer explanation of why a match matters
- safer derived outputs to tenant plane

## 4. Honest Diagnosis

The intelligence plane is architecturally ahead of its product integration.

The risk here is not under-building intelligence.
The risk is building a sophisticated backend that operators and support teams only partially benefit from.

If the next phase does not make intelligence outcomes more actionable, this part of the system will feel expensive and disconnected from the core mission.

## 5. Mission-Critical Completion Targets

### Must-Have

- stronger review-case workflow completion
- dedicated watchlist and risk operations visibility
- clearer feedback loop from intelligence outcome to:
  - onboarding readiness
  - assignment confidence
  - support escalation

### Important But Secondary

- richer person detail workbench
- provider performance visibility
- linkage-event inspection surfaces

## 6. Recommended Work Packages

### Package A: Review Ops Completion

Scope:
- review case detail refinement
- evidence navigation
- resolution consequences and follow-through

### Package B: Risk And Watchlist Operations

Scope:
- dedicated control-plane surfaces
- operator-safe derived signal presentation
- escalation and adjudication loops

### Package C: Intelligence-To-Operations Loop

Scope:
- explicit product contracts for how intelligence outcomes affect tenant workflows
- safer surfacing of canonical and risk outcomes inside operator experiences

### Package D: Person And Linkage Workbench

Scope:
- richer person detail view
- linkage history
- related-case context
- cross-tenant explanation surfaces for authorized staff

## 7. Immediate Next Actions

1. Treat review cases as the foundation, not the full intelligence product.
2. Prioritize watchlist/risk surfaces and action loops next.
3. Define exactly which intelligence outcomes must influence operator workflows in Phase 2 versus Phase 3.
