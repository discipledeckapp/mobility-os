# tenancy-domain

Shared TypeScript package providing core tenancy domain types, value objects, and utilities used by both `api-control-plane` and `api-core`.

## What's In Here

| Export | Description |
|---|---|
| `TenantId` | Branded type for tenant identifiers |
| `BusinessEntityId` / `OperatingUnitId` / `FleetId` | Branded types for the tenant hierarchy |
| `TenantStatus` | Enum of lifecycle states (`active`, `suspended`, `terminated`, etc.) |
| `TERMINAL_TENANT_STATUSES` | Set of terminal lifecycle states |
| `TenantContext` | Request-scoped context carrying `tenantId`, `userId`, `businessEntityId`, `role`, and optional `operatingUnitId` |
| `tenantContextFromJwt()` | Helper to extract `TenantContext` from a decoded JWT payload |
| `assertTenantOwnership()` | Guard that throws if a resource's `tenant_id` does not match the current context |
| `hasTenantOwnership()` | Boolean ownership check variant |

## Usage

```typescript
import { TenantContext, assertTenantOwnership } from '@mobility-os/tenancy-domain';

// In a NestJS guard or service:
const ctx = tenantContextFromJwt(decodedToken);
assertTenantOwnership(vehicle.tenantId, ctx.tenantId);
```

## Design Rules

1. This package must contain **no database access** — types and logic only
2. No dependency on NestJS or any framework — plain TypeScript
3. This package is the shared lifecycle and tenant-context contract for both `api-control-plane` and `api-core`
4. Both `api-control-plane` and `api-core` can import from here without circular deps

## Installation

This package is part of the monorepo workspace and does not need to be published to npm.

```json
// In consuming package.json:
{
  "dependencies": {
    "@mobility-os/tenancy-domain": "workspace:*"
  }
}
```

## Related Docs

- [ADR-004: Control Plane vs Tenant Plane](../../docs/decisions/ADR-004-control-plane-vs-tenant-plane.md)
- [ADR-010: Tenant Business Hierarchy](../../docs/decisions/ADR-010-tenant-business-hierarchy.md)
- [Tenant Lifecycle](../../docs/platform/tenant-lifecycle.md)
