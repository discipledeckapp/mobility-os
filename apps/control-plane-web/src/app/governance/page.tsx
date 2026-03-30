import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
} from '@mobility-os/ui';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import {
  ControlPlaneDataNotice,
  ControlPlaneEmptyStateCard,
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
  ControlPlaneSectionShell,
} from '../../features/shared/control-plane-page-patterns';
import { buildTenantLookup, getTenantLabel } from '../../features/shared/tenant-lookup';
import { getGovernanceOversight, listTenants } from '../../lib/api-control-plane';

function statusTone(
  count: number,
  warningThreshold = 1,
  dangerThreshold = 5,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (count >= dangerThreshold) return 'danger';
  if (count >= warningThreshold) return 'warning';
  return 'success';
}

export default async function GovernancePage() {
  const dataWarnings: string[] = [];
  const [overviewResult, tenantsResult] = await Promise.allSettled([
    getGovernanceOversight(),
    listTenants(),
  ]);
  const overview =
    overviewResult.status === 'fulfilled'
      ? overviewResult.value
      : {
          privacy: {
            totals: {
              openRequests: 0,
              pendingReviewRequests: 0,
              closedRequests: 0,
              consentEventsLast30Days: 0,
              tenantsWithOpenPrivacyRequests: 0,
            },
            tenantSummaries: [],
            requests: [],
            consents: [],
            support: {
              supportEmail: 'support@mobiris.ng',
              supportPhonePrimary: null,
              supportPhoneSecondary: null,
              privacyPolicyVersion: 'unknown',
              termsVersion: 'unknown',
            },
          },
          notifications: {
            totals: {
              notificationsLast30Days: 0,
              unreadNotifications: 0,
              pushDevices: 0,
              pushEnabledUsers: 0,
              tenantsWithUnreadNotifications: 0,
              verificationNotifications: 0,
              remittanceNotifications: 0,
              assignmentNotifications: 0,
              complianceRiskNotifications: 0,
            },
            tenantSummaries: [],
            notifications: [],
          },
        };
  const tenants = tenantsResult.status === 'fulfilled' ? tenantsResult.value : [];
  if (overviewResult.status !== 'fulfilled') dataWarnings.push('Governance oversight could not be loaded from the platform API.');
  if (tenantsResult.status !== 'fulfilled') dataWarnings.push('Organisation labels could not be resolved.');
  const tenantLookup = buildTenantLookup(tenants);
  const mergedTenantIds = new Set([
    ...overview.privacy.tenantSummaries.map((item) => item.tenantId),
    ...overview.notifications.tenantSummaries.map((item) => item.tenantId),
  ]);

  return (
    <ControlPlaneShell
      eyebrow="Platform governance"
      title="Governance and compliance"
      description="Track privacy requests, consent posture, and notification delivery health across tenants so platform support can respond before issues turn into compliance debt."
    >
      <div className="space-y-6">
        {dataWarnings.length > 0 ? (
          <ControlPlaneDataNotice
            description={dataWarnings.join(' ')}
            title="Governance loaded with partial platform data"
          />
        ) : null}
        <ControlPlaneHeroPanel
          badges={[
            { label: `${overview.privacy.totals.openRequests} privacy requests`, tone: overview.privacy.totals.openRequests ? 'warning' : 'success' },
            { label: `${overview.notifications.totals.unreadNotifications} unread notices`, tone: overview.notifications.totals.unreadNotifications ? 'warning' : 'success' },
            { label: `${overview.notifications.totals.pushDevices} push devices`, tone: 'neutral' },
          ]}
          description="This is the platform governance queue for privacy, consent, and notification posture. It should tell support where compliance debt is building and which tenants are not receiving the right notices."
          eyebrow="Privacy and communication oversight"
          title="See which tenants have open privacy pressure or unread operational notices."
        />

        <ControlPlaneMetricGrid columns={4}>
          <ControlPlaneMetricCard
            detail={`${overview.privacy.totals.pendingReviewRequests} pending review across tenants.`}
            label="Open privacy requests"
            tone={overview.privacy.totals.openRequests ? 'warning' : 'success'}
            value={overview.privacy.totals.openRequests}
          />
          <ControlPlaneMetricCard
            detail={`${overview.privacy.support.privacyPolicyVersion} privacy policy currently in force.`}
            label="Consent activity"
            value={overview.privacy.totals.consentEventsLast30Days}
          />
          <ControlPlaneMetricCard
            detail={`${overview.notifications.totals.tenantsWithUnreadNotifications} tenants currently have unread notices.`}
            label="Unread notifications"
            tone={overview.notifications.totals.unreadNotifications ? 'warning' : 'success'}
            value={overview.notifications.totals.unreadNotifications}
          />
          <ControlPlaneMetricCard
            detail={`${overview.notifications.totals.pushEnabledUsers} push-enabled users across tracked tenants.`}
            label="Push delivery footprint"
            value={overview.notifications.totals.pushDevices}
          />
        </ControlPlaneMetricGrid>

        <ControlPlaneSectionShell
          description="This is the platform-side complement to privacy, consent, and notification behavior already happening in tenant web and mobile."
          title="Cross-tenant governance queue"
        >
          {mergedTenantIds.size === 0 ? (
            <ControlPlaneEmptyStateCard
              description="No privacy or notification activity is currently being surfaced."
              title="No governance queue yet"
            />
          ) : (
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Privacy requests</TableHead>
                    <TableHead>Consent activity</TableHead>
                    <TableHead>Notification health</TableHead>
                    <TableHead>Push posture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(mergedTenantIds).map((tenantId) => {
                    const privacy = overview.privacy.tenantSummaries.find((item) => item.tenantId === tenantId);
                    const notifications = overview.notifications.tenantSummaries.find((item) => item.tenantId === tenantId);
                    const tenant = getTenantLabel(tenantLookup, tenantId);

                    return (
                      <TableRow key={tenantId}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{tenant.name}</p>
                            <p className="text-xs text-slate-500">
                              {tenant.slug} · {tenant.country}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <Badge
                            tone={statusTone(
                              (privacy?.openRequests ?? 0) + (privacy?.pendingReviewRequests ?? 0),
                              1,
                              3,
                            )}
                          >
                            {(privacy?.openRequests ?? 0) + (privacy?.pendingReviewRequests ?? 0)} open
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {privacy?.closedRequests ?? 0} closed · last request{' '}
                            {privacy?.lastRequestAt
                              ? new Date(privacy.lastRequestAt).toLocaleDateString()
                              : 'n/a'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {privacy?.consentEventsLast30Days ?? 0} events in 30 days
                          <div className="text-xs text-slate-500">
                            last consent{' '}
                            {privacy?.lastConsentAt
                              ? new Date(privacy.lastConsentAt).toLocaleDateString()
                              : 'n/a'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <Badge tone={statusTone(notifications?.unreadNotifications ?? 0, 1, 10)}>
                            {notifications?.unreadNotifications ?? 0} unread
                          </Badge>
                          <div className="text-xs text-slate-500">
                            {notifications?.notificationsLast30Days ?? 0} sent in last 30 days
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {notifications?.pushDevices ?? 0} devices
                          <div className="text-xs text-slate-500">
                            {notifications?.pushEnabledUsers ?? 0} push-enabled users
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableViewport>
          )}
        </ControlPlaneSectionShell>

        <div className="grid gap-6 xl:grid-cols-2">
          <ControlPlaneSectionShell
            description="Use this to identify unresolved subject-access, deletion, or correction pressure."
            title="Recent privacy requests"
          >
            {overview.privacy.requests.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No privacy requests are currently open or recently recorded."
                title="No privacy queue"
              />
            ) : (
              <div className="space-y-3">
                {overview.privacy.requests.slice(0, 8).map((request) => {
                  const tenant = getTenantLabel(tenantLookup, request.tenantId);
                  return (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={request.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {request.requestType} · {tenant.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.subjectType} · {request.contactEmail ?? 'No contact email'}
                          </p>
                        </div>
                        <Badge tone={request.status === 'closed' ? 'success' : 'warning'}>
                          {request.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {request.details?.trim() || 'No additional request detail was supplied.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ControlPlaneSectionShell>

          <ControlPlaneSectionShell
            description="Delivery visibility for verification, compliance, assignment, and remittance communication."
            title="Recent notification activity"
          >
            {overview.notifications.notifications.length === 0 ? (
              <ControlPlaneEmptyStateCard
                description="No cross-tenant notification activity is currently being surfaced."
                title="No notification feed yet"
              />
            ) : (
              <div className="space-y-3">
                {overview.notifications.notifications.slice(0, 8).map((notification) => {
                  const tenant = getTenantLabel(tenantLookup, notification.tenantId);
                  return (
                    <div className="rounded-2xl border border-slate-200 px-4 py-3" key={notification.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                          <p className="text-xs text-slate-500">
                            {tenant.name} · {notification.user?.email ?? 'Unknown recipient'} · {notification.topic}
                          </p>
                        </div>
                        <Badge tone={notification.readAt ? 'success' : 'warning'}>
                          {notification.readAt ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </ControlPlaneSectionShell>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
