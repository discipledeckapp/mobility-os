# Usage Metering

## Purpose

Usage metering captures events that drive variable billing charges and plan-limit enforcement.

## Meterable Events

| Event | Unit | Billing Impact |
|---|---|---|
| Active vehicles | Per vehicle per billing period | Included up to fleet cap; overage billed |
| Active drivers | Per driver per billing period | Included up to seat limit; overage billed |
| Identity verification calls | Per API call | Billed per call on Intelligence add-on |
| Biometric match operations | Per operation | Billed per operation on Intelligence add-on |
| Remittance transactions | Per transaction | Basis-point fee (optional per contract) |
| API calls | Per 1 000 calls | Applicable on high-volume enterprise plans |

## Metering Architecture

Current stored event stream:
- Raw usage events are stored in `cp_usage_events`

Planned extension inside the existing control-plane boundary:
- Period summaries such as `cp_usage_summaries` may be introduced for faster invoicing and reporting reads

```
Tenant operation
  → emits usage event to metering ingestor
    → events batched and stored in cp_usage_events
      → nightly aggregation job calculates period totals
        → optional summary tables or materializations may be written
          → invoice generation reads aggregates
```

## Idempotency

Every usage event carries an `idempotency_key` (typically `tenantId + resourceId + date`) to prevent double-counting on retries.

## Plan Limit Enforcement

- Soft limits: tenant is warned at 80 % of cap via in-app notification and email
- Hard limits: at 100 % of cap the operation is blocked and the tenant is prompted to upgrade
- Enterprise plans: no hard caps; usage is billed at overage rates

## Reporting

Platform admins can view:
- Real-time usage dashboard per tenant
- Period-to-date usage vs plan limits
- Projected invoice based on current usage pace

Tenants can view their own usage in the settings panel.

These reporting surfaces are target capabilities within the control plane; they are not all wired yet.

## Related Docs

- [Subscription & Billing](./subscription-and-billing.md)
- [Control Plane](./control-plane.md)
- [SaaS Business Model](./saas-business-model.md)
