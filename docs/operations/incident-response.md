# Incident Response

## Scope

Define incident severity levels, escalation paths, response ownership, and communication procedures for Mobility OS production incidents.

## Severity Levels

| Severity | Description | Examples | Response SLA |
|---|---|---|---|
| P1 — Critical | Complete service outage; all tenants affected | DB down, auth service failure | Acknowledge ≤ 15 min; mobilize ≤ 30 min |
| P2 — Major | Core feature broken for a significant subset of tenants | Remittance submission failing, invoicing errors | Acknowledge ≤ 1 hour |
| P3 — Minor | Non-critical feature broken; workaround exists | Report export failing, email notifications delayed | Acknowledge ≤ 4 hours |
| P4 — Low | Cosmetic or low-impact issue | Minor UI glitch, non-critical slow query | Next business day |

## Incident Response Phases

```
1. Detection       → alert fires or user reports issue
2. Acknowledgement → on-call engineer acknowledges within SLA
3. Triage          → determine severity and scope
4. Escalation      → loop in additional responders if P1/P2
5. Mitigation      → restore service (rollback, config change, hotfix)
6. Communication   → update status page; notify affected tenants
7. Resolution      → confirm service restored; close incident
8. Post-mortem     → blameless review within 48 hours (P1) or 5 days (P2)
```

## Escalation Path

| Step | Escalate To | When |
|---|---|---|
| 1 | On-call engineer | Alert fires |
| 2 | Engineering lead | Not resolved within 30 min (P1) or 2 hours (P2) |
| 3 | CTO / Platform lead | Data loss suspected, security breach, or major customer impact |
| 4 | Legal / Compliance | Data breach confirmed or suspected |

## Communication Templates

### Status Page Update (P1 — initial)
```
We are investigating reports of [service disruption]. Our team is actively working on a fix.
Impact: [scope]. Started: [time UTC]. Next update in 30 minutes.
```

### Status Page Update (resolved)
```
This incident has been resolved as of [time UTC]. All services are operating normally.
Root cause and full post-mortem will be published within 48 hours.
```

## Post-Mortem Requirements (P1/P2)

- [ ] Timeline of events (detection → resolution)
- [ ] Root cause identified
- [ ] Contributing factors listed
- [ ] Impact quantified (tenants affected, downtime duration)
- [ ] Action items with owners and due dates
- [ ] Lessons learned

## Related Docs

- [Disaster Recovery](./disaster-recovery.md)
- [Production Readiness Checklist](./production-readiness-checklist.md)
- [Backup & Restore](./backup-and-restore.md)
