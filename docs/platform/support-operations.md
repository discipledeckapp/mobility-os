# Support Operations

## Purpose

Define how platform teams support tenants across onboarding, incident handling, billing issues, and operational escalations.

## Support Tiers

| Tier | Plans | SLA — First Response | SLA — Resolution |
|---|---|---|---|
| Standard | Starter | 24 hours | 5 business days |
| Priority | Growth | 4 hours | 2 business days |
| Dedicated | Enterprise | 1 hour | Same day (critical) |

## Support Channels

- **In-app chat** — Starter & Growth (async, business hours)
- **Email ticketing** — all plans
- **Dedicated Slack channel** — Enterprise only
- **Phone escalation** — Enterprise P1 incidents only

## Ticket Categories

| Category | Examples |
|---|---|
| Onboarding | Account setup, data import, first fleet config |
| Billing & subscription | Invoice disputes, wallet top-up, plan changes |
| Technical / bug | API errors, data discrepancies, performance |
| Operational escalation | Suspension review, feature unlock request |
| Security / fraud | Suspicious access, identity dispute |

## Impersonation Policy

Support agents may impersonate a tenant account for debugging with these controls:
- Impersonation requires a reason and a linked support ticket
- All impersonation sessions are recorded in the audit log
- Maximum session duration: 2 hours
- Impersonation cannot be used to make financial mutations (billing, wallet)

## Escalation Path

```
Support agent
  → Senior support / CSM
    → Engineering on-call (technical bugs)
    → Billing ops (invoice / wallet issues)
      → Platform engineering lead (critical failures)
```

## Onboarding Support Checklist

- [ ] Tenant account created and plan assigned
- [ ] Admin user invited and logged in
- [ ] First business entity created
- [ ] Country config verified
- [ ] First fleet and vehicles added
- [ ] Remittance rules configured
- [ ] Platform wallet funded (if pre-pay model)

## Related Docs

- [Tenant Lifecycle](./tenant-lifecycle.md)
- [Incident Response](../operations/incident-response.md)
- [Control Plane](./control-plane.md)
