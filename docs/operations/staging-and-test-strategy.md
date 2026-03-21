# Staging and Test Strategy

## Approach

Keep costs minimal by starting with:
- One **production** environment
- One **shared non-production** environment (serves as both staging and development sandbox)

Expand environment count only when justified by risk, compliance, or scale (see [ADR-011](../decisions/ADR-011-environment-strategy.md)).

## Environments

| Environment | Purpose | Data | Access |
|---|---|---|---|
| `production` | Live tenant operations | Real tenant data | Restricted; deployment via CI/CD only |
| `nonprod` | Integration testing, QA, demos, development | Synthetic seed data | Engineering team |

## When to Add Environments

Add a third environment (`staging`) when:
- Platform processes regulated financial data requiring pre-production sign-off
- Release cadence increases to the point where nonprod is blocked during QA
- A compliance audit requires a stable, production-mirror environment

## Test Layers

| Layer | Scope | Tool | Run On |
|---|---|---|---|
| Unit tests | Single function / class | Jest / Vitest | Every commit (CI) |
| Integration tests | Module + DB | Jest + test DB | Every PR (CI) |
| E2E tests | Full user flow | Playwright | Every PR + nightly |
| Contract tests | API schema | — | Every PR (CI) |
| Load tests | Throughput and latency | k6 | Weekly (CI) |
| Restore drills | DR / backup validation | Manual | Monthly |

## Seed Data Strategy

Non-production environments use a deterministic seed dataset that covers:
- Multiple tenants (Starter, Growth, Enterprise)
- Multiple countries
- Sample fleets, drivers, and vehicles
- Sample intelligence records (persons, biometrics)
- Sample billing and subscription states

Seed is re-applied on environment reset. Never copy production data to nonprod.

## Deployment Pipeline

```
Developer push → PR opened
  → lint + unit tests
  → integration tests (test DB)
  → E2E tests (nonprod)
  → PR merged → deploy to nonprod
  → manual QA sign-off
  → deploy to production (gated)
```

## Related Docs

- [Production Readiness Checklist](./production-readiness-checklist.md)
- [ADR-011: Environment Strategy](../decisions/ADR-011-environment-strategy.md)
- [Cost Optimization Strategy](./cost-optimization-strategy.md)
