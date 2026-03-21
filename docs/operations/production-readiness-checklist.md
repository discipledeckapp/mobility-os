# Production Readiness Checklist

## Purpose

Verify that every service and the overall platform meets production standards before go-live and after major releases.

## Security

- [ ] All API endpoints require authentication; no unauthenticated routes exposed publicly except intended public endpoints
- [ ] JWT secrets and API keys are rotated from defaults; stored in secrets manager
- [ ] Database credentials not in environment variables of publicly accessible services
- [ ] TLS enforced on all external traffic (HTTPS only)
- [ ] CORS policy configured to allowed origins only
- [ ] Rate limiting enabled on all public APIs
- [ ] Dependency vulnerability scan passing (no critical CVEs)
- [ ] Secrets scan passing (no credentials in git history)

## Observability

- [ ] Structured logging enabled on all services (JSON, includes trace ID)
- [ ] Error tracking configured (e.g. Sentry)
- [ ] Uptime monitoring configured for all public endpoints
- [ ] Database query performance monitoring enabled
- [ ] Alerting configured for P1/P2 error rates and latency thresholds
- [ ] Dashboards available for key business metrics (active tenants, invoices, usage)

## Backups

- [ ] Automated database backups confirmed active
- [ ] Point-in-time recovery window ≥ 7 days
- [ ] Object storage versioning enabled
- [ ] Restore drill completed and documented
- [ ] RTO/RPO targets met in drill

## Tenant Isolation

- [ ] Each tenant's data is row-level isolated with `tenant_id` column + RLS or application-level guard
- [ ] Cross-tenant data leakage tests passing
- [ ] Intelligence API only returns permitted signals; no raw cross-tenant data exposed

## Environment Configuration

- [ ] Production environment uses separate secrets from non-production
- [ ] Feature flags set correctly for production
- [ ] Country config reviewed for active deployment countries
- [ ] Database migration scripts tested on non-production before production apply

## Incident Readiness

- [ ] On-call rotation documented and staffed
- [ ] Incident response runbook published and accessible
- [ ] Status page configured
- [ ] Escalation contacts confirmed (engineering, billing, legal)
- [ ] Post-mortem template ready

## Related Docs

- [Incident Response](./incident-response.md)
- [Backup & Restore](./backup-and-restore.md)
- [Disaster Recovery](./disaster-recovery.md)
- [Staging & Test Strategy](./staging-and-test-strategy.md)
