# Disaster Recovery

## Goal

Define practical disaster recovery targets and recovery approach for Mobility OS. The strategy must be achievable with a lean team and minimal infrastructure overhead during the early platform stage.

## Recovery Targets

| Tier | Scenario | RPO | RTO |
|---|---|---|---|
| P1 — Complete region failure | Primary cloud region unavailable | ≤ 1 hour | ≤ 4 hours |
| P2 — Database corruption / deletion | Primary DB unrecoverable | ≤ 24 hours | ≤ 8 hours |
| P3 — Application failure | All app instances down | 0 (stateless) | ≤ 30 minutes |
| P4 — Partial data loss | Single table / object deleted | ≤ 24 hours | ≤ 4 hours |

See [ADR-012](../decisions/ADR-012-disaster-recovery-targets.md) for the rationale behind these targets.

## Initial Architecture

- **Single primary region** (cost-optimised for early stage)
- **Automated daily backups** of all databases and object storage
- **Restore-tested procedures** — restore drills run monthly
- **Documented recovery runbooks** — see [Backup & Restore](./backup-and-restore.md)

## Recovery Playbooks

| Scenario | Runbook Location |
|---|---|
| Database point-in-time restore | `packages/infra/runbooks/db-point-in-time-restore.md` |
| Full environment rebuild | `packages/infra/runbooks/full-env-rebuild.md` |
| Object storage recovery | `packages/infra/runbooks/object-storage-recovery.md` |
| Application rollback | `packages/infra/runbooks/app-rollback.md` |

## Escalation During a DR Event

```
On-call engineer declares DR event
  → notify platform lead + CTO
  → follow relevant runbook
  → send tenant status page update (within 30 min)
  → hourly updates until recovery
  → post-mortem within 48 hours
```

## Future Evolution

When platform reaches sufficient scale:
- Add a warm-standby replica in a second region
- Reduce P1 RTO to ≤ 1 hour via automated failover

## Related Docs

- [Backup & Restore](./backup-and-restore.md)
- [Incident Response](./incident-response.md)
- [Production Readiness Checklist](./production-readiness-checklist.md)
- [ADR-012: Disaster Recovery Targets](../decisions/ADR-012-disaster-recovery-targets.md)
