# Cost Optimization Strategy

## Objective

Keep infrastructure lean while preserving core reliability, tenant isolation, and backup discipline. Avoid premature scaling spend; invest infrastructure budget where it directly protects revenue or tenant data.

## Guiding Principles

1. **Single-region first** — multi-region adds significant cost; adopt only when RTO requirements demand it
2. **Managed services over self-hosted** — operator overhead is more expensive than managed service premiums at early scale
3. **Shared non-production** — one nonprod environment for all pre-production needs
4. **Right-size compute** — start with smaller instances; scale up with evidence not anticipation
5. **Reserved capacity for stable workloads** — commit to reserved instances for DB and core compute once load is predictable

## Cost Categories and Tactics

| Category | Current Approach | Optimization Tactic |
|---|---|---|
| Compute | On-demand containers | Move stable services to reserved / spot where possible |
| Database | Managed DB (single instance) | Enable read replicas only when read load justifies it |
| Object storage | Standard tier | Move infrequently accessed files to archive tier after 90 days |
| Environments | prod + nonprod | Do not add staging until justified |
| Observability | Hosted log aggregation | Set log retention to 30 days (prod); 7 days (nonprod) |
| Backups | 30-day retention | Review at 6 months; reduce if not using older restores |

## Spend Review Cadence

- Monthly: review cloud spend report; flag anomalies > 20 % month-over-month
- Quarterly: review reserved vs on-demand split; evaluate right-sizing
- Annually: renegotiate managed service contracts

## Cost Guardrails

- Budget alerts at 80 % and 100 % of monthly infra budget
- Any new environment or major resource requires engineering lead approval
- All terraform changes go through PR review with cost estimate comment

## What Not to Cut

- Automated backups and PITR — non-negotiable
- Encryption at rest for biometric and PII data — non-negotiable
- Uptime monitoring and alerting — non-negotiable
- Security scanning in CI — non-negotiable

## Related Docs

- [Staging & Test Strategy](./staging-and-test-strategy.md)
- [Disaster Recovery](./disaster-recovery.md)
- [ADR-011: Environment Strategy](../decisions/ADR-011-environment-strategy.md)
