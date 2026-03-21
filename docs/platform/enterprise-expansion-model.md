# Enterprise Expansion Model

## Objective

Support enterprise customers with:
- Multiple business entities under one tenant account
- Multi-country operations
- Custom pricing and commercial terms
- Custom rollout controls and feature gating
- Deeper support tiers and governance tooling

## Hierarchy

```
Tenant Account
  └── Business Entity (e.g. "Lagos Logistics Ltd")
        └── Operating Unit (e.g. "Surulere Branch")
              └── Fleet
                    └── Vehicles + Drivers
```

See [ADR-010](../decisions/ADR-010-tenant-business-hierarchy.md) for the rationale behind this model.

## Enterprise-Specific Capabilities

| Capability | Description |
|---|---|
| Multi-business | Multiple legal entities under a single subscription |
| Multi-country | Each business entity can operate under a different country config |
| Custom pricing | Negotiated ARR with override rates per line item |
| Dedicated support | Named CSM, SLA-backed escalation path |
| SSO / SCIM | Identity federation with tenant's IdP |
| Audit export | Bulk export of audit logs for compliance |
| White-label option | Custom domain and branding per tenant |

## Expansion Signals (Land-and-Expand)

Triggers for enterprise upsell:
1. Tenant reaches fleet cap on Growth plan
2. Tenant requests a second business entity
3. Tenant requests cross-country operations
4. Tenant requests Intelligence add-on with volume SLA

## Custom Pricing Process

1. Sales negotiates ARR and line-item rates
2. Contract is signed; platform admin creates a custom plan in control plane
3. Plan is assigned to the tenant; overrides are stored in `cp_plans.custom_terms`
4. Billing runs against the custom rate card

## Related Docs

- [SaaS Business Model](./saas-business-model.md)
- [Subscription & Billing](./subscription-and-billing.md)
- [Tenant Lifecycle](./tenant-lifecycle.md)
- [ADR-010: Tenant Business Hierarchy](../decisions/ADR-010-tenant-business-hierarchy.md)
