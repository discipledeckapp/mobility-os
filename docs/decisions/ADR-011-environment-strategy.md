# ADR-011: Environment Strategy

## Status

Accepted

## Context

Early-stage SaaS platforms often over-invest in environment infrastructure (dev / staging / UAT / pre-prod / prod), adding operational overhead and cost before they have the revenue to justify it. The risk of too few environments is that bad deployments reach production; the risk of too many is wasted spend and complexity.

## Decision

Start with:
- **production** — live tenant operations
- **shared non-production** (`nonprod`) — integration testing, QA, demos, and developer sandboxing

Expand environment count only when justified by risk, compliance, or scale.

### Triggers for Adding a Third Environment

- Platform processes regulated financial data requiring a stable pre-production sign-off environment
- Release cadence increases to the point where nonprod is blocked during QA
- A compliance audit requires a production-mirror environment

## Consequences

### Positive
- Minimal infrastructure cost during early stage
- Simple deployment pipeline (nonprod → prod)
- Engineers have one shared sandbox; no per-developer environments to manage

### Negative
- Nonprod serves multiple purposes; risk of QA and development work interfering
- No stable staging mirror; final integration validation happens in nonprod which may be unstable

### Mitigations

- Separate nonprod deployment slots (CI deploys to a named slot; QA works on a stable slot)
- Feature flags gate incomplete work so nonprod remains testable even with in-progress features

## Alternatives Considered

- **Three environments from day one (dev/staging/prod)**: rejected — adds cost and complexity before justified
- **Per-developer environments**: rejected — too expensive and complex at this stage

## Related Docs

- [Staging & Test Strategy](../operations/staging-and-test-strategy.md)
- [Cost Optimization Strategy](../operations/cost-optimization-strategy.md)
