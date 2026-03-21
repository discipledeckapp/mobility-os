# ADR-012: Disaster Recovery Targets

## Status

Accepted

## Context

Without explicit RPO and RTO targets, infrastructure and backup decisions are made ad hoc, often under-investing in recovery capability. Teams discover the gap only during a real incident. Defining targets upfront aligns backup frequency, restore procedures, and on-call readiness before they are needed.

## Decision

Define explicit RPO and RTO targets early and align backup, restore, and operational runbooks to them.

### Targets

| Scenario | RPO | RTO |
|---|---|---|
| Complete region failure | ≤ 1 hour | ≤ 4 hours |
| Database corruption / deletion | ≤ 24 hours | ≤ 8 hours |
| Application failure (stateless) | 0 | ≤ 30 minutes |
| Partial data loss | ≤ 24 hours | ≤ 4 hours |

### Required Practices to Meet Targets

1. Automated daily database snapshots + continuous WAL archiving (meets RPO ≤ 24 hours)
2. Monthly restore drills to validate RTO targets are achievable
3. Documented runbooks for each scenario
4. On-call rotation with clear escalation path

## Consequences

### Positive
- Backup frequency and retention are justified by explicit targets
- Restore drills are scheduled and tracked
- Infrastructure investment decisions are grounded in recovery requirements

### Negative
- Targets must be reviewed as platform scale increases; current targets may become insufficient
- WAL archiving adds storage cost

### Neutral
- Current targets are achievable with managed database services; no custom infrastructure required

## Revision Trigger

Review targets when:
- Platform handles > 50 active tenants
- A regulated financial product is launched on the platform
- An incident reveals a gap between target and actual recovery capability

## Related Docs

- [Disaster Recovery](../operations/disaster-recovery.md)
- [Backup & Restore](../operations/backup-and-restore.md)
- [Production Readiness Checklist](../operations/production-readiness-checklist.md)
