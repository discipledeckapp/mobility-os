# ADR-010: Tenant Business Hierarchy

## Status

Accepted

## Context

Transport operators vary significantly in organisational complexity:
- A small operator may run a single fleet from a single location
- A regional group may have multiple branches, each managing their own fleet
- An enterprise may have multiple legal entities across multiple countries, each with their own operating structure

A flat model (tenant → fleet) cannot support multi-branch or multi-entity operations. But an overly complex hierarchy would make the simple case harder to use.

## Decision

Model tenant account, business entity, operating unit, and fleet as separate layers to support enterprise growth and multi-business structures.

```
Tenant Account         (the SaaS subscription holder)
  └── Business Entity  (a legal or commercial entity, e.g. "Lagos Logistics Ltd")
        └── Operating Unit  (a branch, depot, or city operation)
              └── Fleet     (a group of vehicles managed together)
                    └── Vehicles + Drivers
```

### Rules

- A tenant account is the billing and access control root
- A tenant may have one or many business entities
- Each business entity may have one or many operating units
- Each operating unit may have one or many fleets
- Permissions and feature access are scoped at the tenant level; operational access can be scoped to business entity or operating unit level

## Consequences

### Positive
- Small operators: create one business entity, one operating unit — no complexity exposed
- Enterprise operators: model their real org structure natively
- Enables per-entity country config (a tenant operating in multiple countries)
- Clean billing: all entities under one subscription; usage aggregated at tenant level

### Negative
- More relational complexity in the data model
- Permissions become more nuanced (tenant-level vs entity-level vs unit-level)

### Neutral
- UI must handle the single-entity case gracefully (hide hierarchy depth that isn't needed)

## Alternatives Considered

- **Tenant → Fleet (flat)**: rejected — cannot support multi-branch enterprise customers
- **Full tree with unlimited depth**: rejected — unnecessary complexity; four layers covers all known use cases

## Related Docs

- [Enterprise Expansion Model](../platform/enterprise-expansion-model.md)
- [ADR-004: Control Plane vs Tenant Plane](./ADR-004-control-plane-vs-tenant-plane.md)
