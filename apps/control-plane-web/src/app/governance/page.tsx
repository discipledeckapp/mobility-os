import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
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
  const [overview, tenants] = await Promise.all([
    getGovernanceOversight(),
    listTenants().catch(() => []),
  ]);

  const tenantNameById = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));
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
        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Open privacy requests</CardDescription>
              <CardTitle>{overview.privacy.totals.openRequests}</CardTitle>
              <Text tone="muted">
                {overview.privacy.totals.pendingReviewRequests} pending review across tenants.
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Consent activity</CardDescription>
              <CardTitle>{overview.privacy.totals.consentEventsLast30Days}</CardTitle>
              <Text tone="muted">
                {overview.privacy.support.privacyPolicyVersion} privacy policy version currently in
                force.
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Unread notifications</CardDescription>
              <CardTitle>{overview.notifications.totals.unreadNotifications}</CardTitle>
              <Text tone="muted">
                {overview.notifications.totals.tenantsWithUnreadNotifications} tenants currently
                have unread platform-relevant notices.
              </Text>
            </CardHeader>
          </Card>
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardDescription>Push delivery footprint</CardDescription>
              <CardTitle>{overview.notifications.totals.pushDevices}</CardTitle>
              <Text tone="muted">
                {overview.notifications.totals.pushEnabledUsers} push-enabled users across tracked
                tenants.
              </Text>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle>Cross-tenant governance queue</CardTitle>
            <CardDescription>
              This is the platform-side complement to privacy, consent, and notification behavior
              already happening in tenant web and the driver app.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    const privacy = overview.privacy.tenantSummaries.find(
                      (item) => item.tenantId === tenantId,
                    );
                    const notifications = overview.notifications.tenantSummaries.find(
                      (item) => item.tenantId === tenantId,
                    );

                    return (
                      <TableRow key={tenantId}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {tenantNameById.get(tenantId) ?? tenantId}
                          </div>
                          <div className="text-xs text-slate-500">{tenantId}</div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          <Badge
                            tone={statusTone(
                              (privacy?.openRequests ?? 0) + (privacy?.pendingReviewRequests ?? 0),
                              1,
                              3,
                            )}
                          >
                            {(privacy?.openRequests ?? 0) + (privacy?.pendingReviewRequests ?? 0)}{' '}
                            open
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
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Recent privacy requests</CardTitle>
              <CardDescription>
                Use this to identify unresolved subject-access, deletion, or correction pressure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.privacy.requests.slice(0, 8).map((request) => (
                <div className="rounded-2xl border border-slate-200 px-4 py-3" key={request.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {request.requestType} ·{' '}
                        {tenantNameById.get(request.tenantId) ?? request.tenantId}
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
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Recent notification activity</CardTitle>
              <CardDescription>
                Delivery visibility for verification, compliance, assignment, and remittance
                communication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.notifications.notifications.slice(0, 8).map((notification) => (
                <div
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  key={notification.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-500">
                        {tenantNameById.get(notification.tenantId) ?? notification.tenantId} ·{' '}
                        {notification.user?.email ?? 'Unknown recipient'} · {notification.topic}
                      </p>
                    </div>
                    <Badge tone={notification.readAt ? 'success' : 'warning'}>
                      {notification.readAt ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
