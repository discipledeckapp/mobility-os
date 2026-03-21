# ADR-004: Control Plane vs Tenant Plane

## Status

Accepted

## Context

As a multi-tenant SaaS platform, Mobility OS needs to manage two distinct concerns:

1. **Platform governance** — managing tenant accounts, subscriptions, billing, feature flags, and platform-wide intelligence
2. **Tenant operations** — fleet management, driver records, remittance, accounting, and all day-to-day business workflows

The risk of combining these in a single application is that governance logic becomes entangled with operational logic, making it harder to enforce access boundaries, scale independently, or audit platform-level actions.

## Decision

Separate platform governance concerns from tenant operational workflows, even if initially deployed within a modular monolith.

- **Control plane** lives in `apps/api-control-plane` with schema prefix `cp_*`
- **Tenant data plane** lives in `apps/api-core` with its own schema prefixes
- Both apps may share the same database server initially, but maintain strict schema separation
- Control-plane APIs are only accessible to platform staff roles; tenant users have no access

## Consequences

### Positive
- Clear access boundary: tenant users can never call control-plane endpoints
- Platform governance can evolve independently of tenant features
- Audit logs for platform-level actions are cleanly separated
- Enables future extraction into a fully separate service without a full rewrite

### Negative
- Two codebases to maintain from day one
- Some shared infrastructure (DB, auth) must serve both; requires careful configuration

### Neutral
- Shared packages (e.g. `packages/tenancy-domain`, `packages/authz-model`) can be used by both apps without violating the boundary

## Alternatives Considered

- **Single monolith with RBAC guards**: rejected because RBAC alone is insufficient to enforce the architectural boundary as the team grows
- **Fully separate microservices from day one**: rejected as over-engineering for current scale; modular monolith achieves the same boundary at lower operational cost

## Related Docs

- [Control Plane](../platform/control-plane.md)
- [ADR-010: Tenant Business Hierarchy](./ADR-010-tenant-business-hierarchy.md)
