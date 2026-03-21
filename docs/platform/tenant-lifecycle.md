# Tenant Lifecycle

This document defines the canonical tenant lifecycle model used across the platform. The lifecycle state machine is owned by the control-plane boundary, even where the full `tenant-lifecycle` service module is still pending implementation.

## Lifecycle Stages

| Stage | Description |
|---|---|
| `lead` | Prospect identified; no account created yet |
| `prospect` | Trial account created; data entry allowed; billing not active |
| `onboarded` | Plan assigned, wallet funded, first setup complete |
| `active` | Tenant is paying and operating normally |
| `past_due` | Invoice overdue; service degraded (read-only mode) |
| `grace_period` | Final warning before suspension; limited write access |
| `suspended` | Service access blocked; data preserved |
| `terminated` | Contract ended; tenant data scheduled for archival |
| `archived` | Data retained per retention policy; no access |

## Major Lifecycle Events

- `plan_assigned` — a plan is applied to a tenant account
- `wallet_funded` — initial platform wallet balance confirmed
- `first_business_created` — first business entity created in the tenant
- `first_fleet_activated` — first fleet becomes operationally active
- `usage_threshold_reached` — usage exceeds a defined tier threshold (triggers upsell)
- `payment_failed` — invoice payment unsuccessful (triggers past_due)
- `payment_recovered` — overdue invoice settled (returns to active)
- `suspension_lifted` — admin action restores access after suspension
- `termination_requested` — tenant or platform initiates offboarding

## Transitions

```
lead → prospect → onboarded → active ↔ past_due ↔ grace_period → suspended → terminated → archived
```

Forced transitions (e.g. admin suspension) may skip intermediate stages.

The control plane is the source of truth for these transitions. Tenant-plane services should consume the resulting tenant status, not define alternate lifecycle states.

## Data Retention Policy

| Stage | Data Visibility | Retention Duration |
|---|---|---|
| terminated | No tenant access; platform read-only | 90 days |
| archived | Platform read-only | Per jurisdiction (default 7 years) |

## Related Docs

- [Subscription & Billing](./subscription-and-billing.md)
- [Support Operations](./support-operations.md)
- [Enterprise Expansion Model](./enterprise-expansion-model.md)
