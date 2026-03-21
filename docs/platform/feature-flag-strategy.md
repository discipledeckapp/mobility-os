# Feature Flag Strategy

## Purpose

Feature flags allow platform operators to gate, gradually roll out, or kill-switch features without deploying new code. They provide fine-grained control at the tenant, country, or global level.

This is the canonical strategy for feature-flag behavior. The data model exists in the control-plane schema, while the full control-plane feature-flag module is still being wired.

## Flag Scopes

| Scope | Description | Managed By |
|---|---|---|
| Global | Applies to all tenants | Platform admin |
| Country | Applies to all tenants in a given country | Platform admin |
| Plan | Applies to all tenants on a specific plan tier | Platform admin |
| Tenant | Applies to a single tenant | Platform admin or CSM |

Tenant-level flags override plan-level; plan-level overrides country-level; country-level overrides global.

## Flag Lifecycle

```
draft → enabled (staged rollout) → enabled (full) → deprecated → removed
```

- New features start in `draft` (disabled everywhere)
- Staged rollout: enable for a canary set of tenants first
- Graduate to full rollout after validation
- Deprecate when the feature is replaced or removed

## Flag Categories

| Category | Examples |
|---|---|
| Feature availability | `intelligence_add_on`, `multi_country_mode` |
| UI experiments | `new_dashboard_layout`, `remittance_v2_ui` |
| Kill switches | `disable_biometric_matching`, `freeze_invoicing` |
| Rollout gates | `enable_mobile_offline_sync` |
| Internal tooling | `enable_debug_logging`, `impersonation_allowed` |

## Implementation Rules

- Flags are stored in `cp_feature_flags` (control plane)
- The tenant data plane is expected to read flags via a cached flags service
- Code must not contain permanent flag checks — flags must be cleaned up after full rollout
- Every flag must have an owner, description, and expiry date

## Anti-Patterns to Avoid

- Long-lived flags that accumulate as permanent config → schedule removal
- Using flags to hide incomplete features in production → use environments instead
- Bypassing flags in tests → tests must exercise both flag states

## Related Docs

- [Control Plane](./control-plane.md)
- [ADR-011: Environment Strategy](../decisions/ADR-011-environment-strategy.md)
