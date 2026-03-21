# Backup and Restore

## Scope

| Component | Backup Method | Frequency | Retention |
|---|---|---|---|
| Primary database | Automated snapshots + WAL archiving | Daily full; continuous WAL | 30 days |
| Object storage (documents, biometrics) | Cross-region replication + versioning | Continuous | 30 days |
| Config / secrets | Terraform state + secrets manager | On change | Indefinite |
| Audit logs | Append-only log store | Continuous | 7 years |

## Database Backups

- **Provider**: Managed database service (e.g. RDS, Cloud SQL) automated snapshots
- **Point-in-time recovery (PITR)**: Enabled; minimum 7-day window, target 30-day
- **Restore validation**: Monthly restore drill to isolated environment; must complete within stated RTO
- **Encryption**: Backups encrypted at rest using platform KMS key

## Object Storage Backups

- Versioning enabled on all buckets
- Deletion protection: object deletion requires MFA confirmation (production)
- Soft-delete retention: 30 days before permanent deletion

## Config Backups

- Terraform state stored in a versioned backend (e.g. S3 + DynamoDB lock)
- Secrets stored in a managed secrets service; not in git
- Environment variable snapshots taken before each deployment

## Restore Validation Checklist

Run monthly (or after any major infrastructure change):

- [ ] Restore database snapshot to isolated environment
- [ ] Verify row counts against production reference counts
- [ ] Verify application starts successfully against restored DB
- [ ] Verify tenant login and core operations work
- [ ] Record restore duration (must be within RTO target)
- [ ] Record any failures and update runbooks accordingly

## Restore Runbooks

| Scenario | Steps |
|---|---|
| Point-in-time DB restore | Snapshot → provision restore instance → verify → swap connection string |
| Full environment rebuild | Terraform apply → restore DB → restore object storage → redeploy apps |
| Single table recovery | PITR restore to isolated instance → extract table dump → apply to production |

## Related Docs

- [Disaster Recovery](./disaster-recovery.md)
- [Production Readiness Checklist](./production-readiness-checklist.md)
