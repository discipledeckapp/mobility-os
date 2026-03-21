# authz-model

Shared TypeScript package defining the authorization model for Mobility OS. Provides roles, permissions, and guard utilities used by all backend services and frontend applications.

## What's In Here

| Export | Description |
|---|---|
| `PlatformRole` | Enum of platform staff roles: `PLATFORM_ADMIN`, `SUPPORT_AGENT`, `BILLING_OPS` |
| `TenantRole` | Enum of tenant user roles: `TENANT_OWNER`, `FLEET_MANAGER`, `FINANCE_OFFICER`, `FIELD_OFFICER`, `READ_ONLY` |
| `Permission` | Enum of fine-grained permissions (e.g. `vehicles:write`, `remittance:approve`) |
| `rolePermissions` | Map from role to set of permissions |
| `hasPermission()` | Check if a role grants a given permission |
| `isPlatformRole()` | Type guard to distinguish platform roles from tenant roles |
| `isTenantRole()` | Type guard |
| `canImpersonate()` | Helper that returns whether a role is allowed to start an impersonation session |

## Role Hierarchy

```
Platform side:
  PLATFORM_ADMIN     — full platform access
  SUPPORT_AGENT      — tenant read + impersonation (read-only)
  BILLING_OPS        — billing and wallet mutations

Tenant side:
  TENANT_OWNER       — all tenant operations
  FLEET_MANAGER      — vehicles, drivers, assignments, maintenance
  FINANCE_OFFICER    — remittance, accounting, wallets
  FIELD_OFFICER      — mobile-limited: inspections, remittance capture
  READ_ONLY          — view-only across all tenant features
```

## Usage

```typescript
import { hasPermission, TenantRole, Permission } from '@mobility-os/authz-model';

if (!hasPermission(user.role, Permission.REMITTANCE_APPROVE)) {
  throw new ForbiddenException();
}
```

## Design Rules

1. No database access — pure type definitions and logic
2. No NestJS dependency — plain TypeScript so it can be used in Next.js middleware too
3. Permissions are additive; roles are not hierarchical (explicit grant per role)
4. Impersonation policy is enforced by consuming services; this package defines roles and permissions, not support-session workflow

## Installation

```json
{
  "dependencies": {
    "@mobility-os/authz-model": "workspace:*"
  }
}
```

## Related Docs

- [Control Plane](../../docs/platform/control-plane.md)
- [Support Operations](../../docs/platform/support-operations.md)
- [ADR-004: Control Plane vs Tenant Plane](../../docs/decisions/ADR-004-control-plane-vs-tenant-plane.md)
