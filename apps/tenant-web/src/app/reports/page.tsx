import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { TenantAppShell } from '../../features/shared/tenant-app-shell';
import {
  type AssignmentRecord,
  type FleetRecord,
  getLicenceExpiryReport,
  getOperationalReadinessReport,
  getTenantApiToken,
  getTenantMe,
  listAssignments,
  listDrivers,
  listFleets,
  listRemittances,
  listVehicles,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';

function formatCurrency(amountMinorUnits: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinorUnits / 100);
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function normaliseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function actionHrefForDriver(driverId: string): Route {
  return `/drivers/${driverId}` as Route;
}

function actionHrefForVehicle(vehicleId: string): Route {
  return `/vehicles/${vehicleId}` as Route;
}

function actionHrefForAssignment(assignmentId: string): Route {
  return `/assignments/${assignmentId}` as Route;
}

function isCompletedRemittance(status: string) {
  return status === 'completed' || status === 'confirmed';
}

function isRemittanceModel(assignment: AssignmentRecord) {
  return assignment.paymentModel === 'remittance' || assignment.paymentModel === 'hire_purchase';
}

function riskTone(count: number): 'success' | 'warning' | 'danger' {
  if (count === 0) return 'success';
  if (count <= 3) return 'warning';
  return 'danger';
}

function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: Route;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <Heading size="h2">{title}</Heading>
        <Text tone="muted">{description}</Text>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button variant="secondary">{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}

function MetricCard({
  title,
  value,
  caption,
  tone = 'default',
}: {
  title: string;
  value: string;
  caption: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{caption}</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={`text-3xl font-semibold tracking-[-0.04em] ${
            tone === 'danger'
              ? 'text-rose-600'
              : tone === 'success'
                ? 'text-emerald-600'
              : tone === 'warning'
                ? 'text-amber-600'
                : 'text-[var(--mobiris-ink)]'
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function InsightListCard({
  title,
  description,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  const hasItems = Boolean(children);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasItems ? (
          <div className="space-y-3">{children}</div>
        ) : (
          <div className="rounded-[var(--mobiris-radius-card)] border border-dashed border-slate-200 bg-slate-50/80 p-4">
            <Text tone="strong">{emptyTitle}</Text>
            <Text tone="muted">{emptyDescription}</Text>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QueueItem({
  title,
  subtitle,
  badges,
  href,
  ctaLabel,
}: {
  title: string;
  subtitle: string;
  badges?: Array<{ label: string; tone?: 'success' | 'warning' | 'danger' }>;
  href: Route;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="space-y-1">
            <Text tone="strong">{title}</Text>
            <Text tone="muted">{subtitle}</Text>
          </div>
          {badges && badges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <Badge key={badge.label} tone={badge.tone ?? 'warning'}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <Link href={href}>
          <Button size="sm" variant="secondary">
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const token = await getTenantApiToken().catch(() => undefined);
  const [report, licenceExpiry, assignmentsPage, driversPage, vehiclesPage, fleets, remittancesPage, tenant] =
    await Promise.all([
      getOperationalReadinessReport(token),
      getLicenceExpiryReport(token),
      listAssignments({ limit: 200 }, token),
      listDrivers({ limit: 200 }, token),
      listVehicles({ limit: 200 }, token),
      listFleets(token).catch(() => [] as FleetRecord[]),
      listRemittances({ limit: 200 }, token),
      getTenantMe(token).catch(() => null),
    ]);

  const locale = getFormattingLocale(tenant?.country);
  const today = startOfDay();
  const monthStart = startOfMonth(today);
  const fleetNames = new Map(fleets.map((fleet) => [fleet.id, fleet.name]));
  const drivers = driversPage.data;
  const vehicles = vehiclesPage.data;
  const assignments = assignmentsPage.data;
  const remittances = remittancesPage.data;

  const driverById = new Map(drivers.map((driver) => [driver.id, driver]));
  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const readinessByDriverId = new Map(report.drivers.map((driver) => [driver.id, driver]));

  const activeAssignments = assignments.filter((assignment) =>
    ['pending_driver_confirmation', 'driver_action_required', 'accepted', 'active'].includes(
      assignment.status,
    ),
  );
  const remittanceAssignments = activeAssignments.filter(isRemittanceModel);
  const activeAssignmentDriverIds = new Set(activeAssignments.map((assignment) => assignment.driverId));
  const activeAssignmentVehicleIds = new Set(activeAssignments.map((assignment) => assignment.vehicleId));

  const overdueRemittances = remittances
    .filter((remittance) => !isCompletedRemittance(remittance.status) && remittance.status !== 'waived')
    .filter((remittance) => {
      const dueDate = normaliseDate(remittance.dueDate);
      return dueDate !== null && dueDate < today;
    })
    .sort((left, right) => {
      const leftDate = normaliseDate(left.dueDate)?.getTime() ?? 0;
      const rightDate = normaliseDate(right.dueDate)?.getTime() ?? 0;
      return leftDate - rightDate;
    });

  const recordedThisMonthMinorUnits = sum(
    remittances
      .filter((remittance) => isCompletedRemittance(remittance.status))
      .filter((remittance) => {
        const paidDate = normaliseDate(remittance.paidDate ?? remittance.createdAt);
        return paidDate !== null && paidDate >= monthStart;
      })
      .map((remittance) => remittance.amountMinorUnits ?? 0),
  );

  const expectedFromActivePlansMinorUnits = sum(
    remittanceAssignments.map(
      (assignment): number =>
        assignment.financialContract?.summary.nextDueAmountMinorUnits ??
        assignment.financialContract?.summary.expectedPerPeriodAmountMinorUnits ??
        assignment.remittanceAmountMinorUnits ??
        0,
    ),
  );
  const remittanceGapMinorUnits = Math.max(
    expectedFromActivePlansMinorUnits - recordedThisMonthMinorUnits,
    0,
  );

  const blockedDrivers = report.drivers.filter((driver) => driver.activationReadiness !== 'ready');
  const pendingVerificationDrivers = drivers.filter(
    (driver) =>
      driver.identityStatus !== 'verified' &&
      driver.identityStatus !== 'review_needed' &&
      driver.status !== 'terminated',
  );
  const missingGuarantorDrivers = drivers.filter((driver) => {
    const guarantorComponent = driver.verificationComponents?.find(
      (component) => component.key === 'guarantor',
    );
    if (guarantorComponent?.required) {
      return guarantorComponent.status !== 'completed';
    }
    return driver.activationReadinessReasons.some((reason) => /guarantor/i.test(reason));
  });
  const licenceExpiryDue = licenceExpiry
    .filter((item) => item.daysUntilExpiry <= 30)
    .sort((left, right) => left.daysUntilExpiry - right.daysUntilExpiry);

  const idleVehicles = vehicles.filter(
    (vehicle) => vehicle.status !== 'maintenance' && !activeAssignmentVehicleIds.has(vehicle.id),
  );
  const unusedDrivers = drivers.filter((driver) => {
    const readiness = readinessByDriverId.get(driver.id);
    return (
      driver.status === 'active' &&
      readiness?.activationReadiness === 'ready' &&
      !activeAssignmentDriverIds.has(driver.id)
    );
  });

  const flaggedDrivers = drivers.filter(
    (driver) =>
      driver.riskBand === 'high' ||
      driver.isWatchlisted === true ||
      driver.expiredDocumentCount > 0 ||
      driver.rejectedDocumentCount > 0,
  );
  const vehicleRiskItems = report.vehicles.filter(
    (vehicle) =>
      vehicle.status === 'maintenance' ||
      vehicle.lifecycleStage === 'retired' ||
      vehicle.remittanceRiskStatus === 'at_risk',
  );

  const hirePurchaseAssignments = activeAssignments.filter(
    (assignment) =>
      assignment.paymentModel === 'hire_purchase' &&
      assignment.financialContract?.summary.outstandingBalanceMinorUnits !== null &&
      assignment.financialContract?.summary.outstandingBalanceMinorUnits !== undefined,
  );
  const hirePurchaseOutstandingMinorUnits = sum(
    hirePurchaseAssignments.map(
      (assignment): number => assignment.financialContract?.summary.outstandingBalanceMinorUnits ?? 0,
    ),
  );
  const hirePurchaseAtRisk = hirePurchaseAssignments.filter(
    (assignment) =>
      assignment.financialContract?.summary.contractStatus === 'overdue' ||
      (assignment.financialContract?.summary.overduePeriods ?? 0) > 0,
  );
  const reportingCurrency =
    remittanceAssignments[0]?.remittanceCurrency ??
    remittances[0]?.currency ??
    'NGN';

  return (
    <TenantAppShell
      title="Operations Insights"
      eyebrow="Insights"
      description="Action queues for remittance health, driver readiness, assignment utilization, and fleet risk."
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <Heading size="h1">Operations Insights</Heading>
              <Text tone="muted">
                Use this page to spot what is blocked, what is idle, and what needs action next.
              </Text>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/assignments">
                <Button>Create assignment</Button>
              </Link>
              <Link href="/remittance">
                <Button variant="secondary">Open remittance</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              caption="Drivers who cannot operate yet"
              title="Blocked drivers"
              tone={blockedDrivers.length > 0 ? 'danger' : 'default'}
              value={String(blockedDrivers.length)}
            />
            <MetricCard
              caption="Collections that are already overdue"
              title="Overdue remittances"
              tone={overdueRemittances.length > 0 ? 'danger' : 'default'}
              value={String(overdueRemittances.length)}
            />
            <MetricCard
              caption="Assignments currently in motion"
              title="Active assignments"
              value={String(activeAssignments.length)}
            />
            <MetricCard
              caption="Vehicles ready but not in use"
              title="Idle vehicles"
              tone={idleVehicles.length > 0 ? 'warning' : 'default'}
              value={String(idleVehicles.length)}
            />
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            actionHref="/remittance"
            actionLabel="Open remittance"
            description="See who is overdue, what should have been collected, and where collections are slipping."
            title="Remittance Health"
          />

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <InsightListCard
              description="Focus first on drivers whose collections are already late or disputed."
              emptyDescription="No overdue remittances are currently blocking collections."
              emptyTitle="Collections look healthy"
              title="Overdue collection queue"
            >
              {overdueRemittances.slice(0, 5).map((remittance) => {
                const driver = driverById.get(remittance.driverId);
                return (
                  <QueueItem
                    badges={[
                      { label: remittance.status === 'disputed' ? 'Disputed' : 'Overdue', tone: 'danger' },
                      {
                        label: formatCurrency(remittance.amountMinorUnits, remittance.currency, locale),
                        tone: 'warning',
                      },
                    ]}
                    ctaLabel="View driver"
                    href={actionHrefForDriver(remittance.driverId)}
                    key={remittance.id}
                    subtitle={`Due ${formatDate(remittance.dueDate, locale)}${driver?.fleetId ? ` • ${fleetNames.get(driver.fleetId) ?? 'Fleet pending'}` : ''}`}
                    title={driver ? `${driver.firstName} ${driver.lastName}`.trim() : 'Assigned driver'}
                  />
                );
              })}
            </InsightListCard>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle>Collection signal</CardTitle>
                <CardDescription>
                  Compare active collection plans with what has been recorded this month.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                    <Text tone="muted">Expected from active plans</Text>
                    <Heading size="h3">
                      {formatCurrency(expectedFromActivePlansMinorUnits, reportingCurrency, locale)}
                    </Heading>
                  </div>
                  <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                    <Text tone="muted">Recorded this month</Text>
                    <Heading size="h3">
                      {formatCurrency(recordedThisMonthMinorUnits, reportingCurrency, locale)}
                    </Heading>
                  </div>
                  <div className="rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-4">
                    <Text tone="muted">Current gap</Text>
                    <Heading size="h3">
                      {formatCurrency(remittanceGapMinorUnits, reportingCurrency, locale)}
                    </Heading>
                  </div>
                </div>
                <Text tone="muted">
                  A large gap means planned collections are not yet being captured in remittance records.
                </Text>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            actionHref="/drivers"
            actionLabel="Open drivers"
            description="Find who is blocked, what verification work is still pending, and who needs follow-up."
            title="Driver Readiness"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              caption="Drivers blocked from operating"
              title="Not ready"
              tone={blockedDrivers.length > 0 ? 'danger' : 'default'}
              value={String(blockedDrivers.length)}
            />
            <MetricCard
              caption="Drivers still waiting on identity work"
              title="Pending verification"
              tone={pendingVerificationDrivers.length > 0 ? 'warning' : 'default'}
              value={String(pendingVerificationDrivers.length)}
            />
            <MetricCard
              caption="Licences expiring in the next 30 days"
              title="Licence watch"
              tone={licenceExpiryDue.length > 0 ? 'warning' : 'default'}
              value={String(licenceExpiryDue.length)}
            />
            <MetricCard
              caption="Drivers still missing a required guarantor"
              title="Guarantor gaps"
              tone={missingGuarantorDrivers.length > 0 ? 'warning' : 'default'}
              value={String(missingGuarantorDrivers.length)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <InsightListCard
              description="These drivers still need operator action before they can operate."
              emptyDescription="Every tracked driver is currently clear to move forward."
              emptyTitle="No blocked drivers"
              title="Readiness blockers"
            >
              {blockedDrivers.slice(0, 5).map((driver) => (
                <QueueItem
                  badges={[
                    {
                      label: driver.activationReadiness === 'partially_ready' ? 'Partially ready' : 'Blocked',
                      tone: 'warning' as const,
                    },
                    ...(driver.riskBand
                      ? [
                          {
                            label: `Risk: ${driver.riskBand}`,
                            tone: (driver.riskBand === 'high' ? 'danger' : 'warning') as
                              | 'danger'
                              | 'warning',
                          },
                        ]
                      : []),
                  ]}
                  ctaLabel="Resolve issue"
                  href={actionHrefForDriver(driver.id)}
                  key={driver.id}
                  subtitle={driver.activationReadinessReasons[0] ?? 'Readiness review required'}
                  title={driver.fullName}
                />
              ))}
            </InsightListCard>

            <InsightListCard
              description="Handle licences that are already expired or about to expire."
              emptyDescription="No licence expiries need attention right now."
              emptyTitle="Licence queue is clear"
              title="Licence expiry watch"
            >
              {licenceExpiryDue.slice(0, 5).map((item) => (
                <QueueItem
                  badges={[
                    {
                      label: item.daysUntilExpiry <= 0 ? 'Expired' : `${item.daysUntilExpiry} days left`,
                      tone: (item.daysUntilExpiry <= 7 ? 'danger' : 'warning') as
                        | 'danger'
                        | 'warning',
                    },
                  ]}
                  ctaLabel="View driver"
                  href={actionHrefForDriver(item.driverId)}
                  key={item.driverId}
                  subtitle={`${fleetNames.get(item.fleetId) ?? 'Fleet pending'} • ${formatDate(item.expiresAt, locale)}`}
                  title={item.fullName}
                />
              ))}
            </InsightListCard>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            actionHref="/assignments"
            actionLabel="Open assignments"
            description="Spot idle capacity and move ready drivers and vehicles into active work."
            title="Assignment Utilization"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              caption="Assignments currently active or awaiting driver confirmation"
              title="Assignments in motion"
              value={String(activeAssignments.length)}
            />
            <MetricCard
              caption="Ready drivers with no active assignment"
              title="Unused drivers"
              tone={unusedDrivers.length > 0 ? 'warning' : 'default'}
              value={String(unusedDrivers.length)}
            />
            <MetricCard
              caption="Vehicles not currently attached to active work"
              title="Idle vehicles"
              tone={idleVehicles.length > 0 ? 'warning' : 'default'}
              value={String(idleVehicles.length)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <InsightListCard
              description="Assign these ready drivers before they sit idle."
              emptyDescription="Every ready active driver is already attached to live work."
              emptyTitle="No unused ready drivers"
              title="Drivers ready for assignment"
            >
              {unusedDrivers.slice(0, 5).map((driver) => (
                <QueueItem
                  badges={[
                    {
                      label: driver.identityStatus === 'verified' ? 'Verified' : driver.identityStatus,
                      tone: 'success' as const,
                    },
                  ]}
                  ctaLabel="Assign driver"
                  href={'/assignments' as Route}
                  key={driver.id}
                  subtitle={`${fleetNames.get(driver.fleetId) ?? 'Fleet pending'} • ${driver.assignmentReadinessReasons[0] ?? 'Ready for assignment'}`}
                  title={`${driver.firstName} ${driver.lastName}`.trim()}
                />
              ))}
            </InsightListCard>

            <InsightListCard
              description="These vehicles are available but not supporting an active assignment."
              emptyDescription="No idle vehicles need attention right now."
              emptyTitle="Vehicle utilization is healthy"
              title="Idle fleet capacity"
            >
              {idleVehicles.slice(0, 5).map((vehicle) => (
                <QueueItem
                  badges={[
                    {
                      label: vehicle.status === 'available' ? 'Available' : vehicle.status,
                      tone: 'warning' as const,
                    },
                  ]}
                  ctaLabel="View vehicle"
                  href={actionHrefForVehicle(vehicle.id)}
                  key={vehicle.id}
                  subtitle={`${fleetNames.get(vehicle.fleetId) ?? 'Fleet pending'} • ${vehicle.make} ${vehicle.model}`}
                  title={vehicle.tenantVehicleCode || vehicle.systemVehicleCode}
                />
              ))}
            </InsightListCard>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            actionHref="/drivers"
            actionLabel="Review risks"
            description="Keep an eye on document expiry, verification gaps, and drivers or vehicles that need intervention."
            title="Fleet Risk"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              caption="Drivers carrying document or verification risk"
              title="Flagged drivers"
              tone={flaggedDrivers.length > 0 ? 'danger' : 'default'}
              value={String(flaggedDrivers.length)}
            />
            <MetricCard
              caption="Vehicles in maintenance, retired state, or remittance risk"
              title="Vehicle issues"
              tone={vehicleRiskItems.length > 0 ? 'warning' : 'default'}
              value={String(vehicleRiskItems.length)}
            />
            <MetricCard
              caption="Current issue load across the fleet"
              title="Risk posture"
              value={flaggedDrivers.length + vehicleRiskItems.length === 0 ? 'Stable' : 'Attention needed'}
              tone={riskTone(flaggedDrivers.length + vehicleRiskItems.length)}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <InsightListCard
              description="Drivers with high-risk indicators or document problems should be reviewed first."
              emptyDescription="No drivers are currently surfacing high-priority risk flags."
              emptyTitle="Driver risk queue is clear"
              title="Driver risk queue"
            >
              {flaggedDrivers.slice(0, 5).map((driver) => (
                <QueueItem
                  badges={[
                    ...(driver.riskBand
                      ? [
                          {
                            label: `Risk: ${driver.riskBand}`,
                            tone: (driver.riskBand === 'high' ? 'danger' : 'warning') as
                              | 'danger'
                              | 'warning',
                          },
                        ]
                      : []),
                    ...(driver.expiredDocumentCount > 0
                      ? [{ label: `${driver.expiredDocumentCount} expired docs`, tone: 'danger' as const }]
                      : []),
                    ...(driver.rejectedDocumentCount > 0
                      ? [{ label: `${driver.rejectedDocumentCount} rejected docs`, tone: 'warning' as const }]
                      : []),
                  ]}
                  ctaLabel="Resolve issue"
                  href={actionHrefForDriver(driver.id)}
                  key={driver.id}
                  subtitle={driver.activationReadinessReasons[0] ?? 'Review risk and compliance status'}
                  title={`${driver.firstName} ${driver.lastName}`.trim()}
                />
              ))}
            </InsightListCard>

            <InsightListCard
              description="Maintenance and lifecycle risks on vehicles can block dispatch and earnings."
              emptyDescription="No vehicle risk signals need action right now."
              emptyTitle="Vehicle risk queue is clear"
              title="Vehicle risk queue"
            >
              {vehicleRiskItems.slice(0, 5).map((vehicle) => (
                <QueueItem
                  badges={[
                    {
                      label: vehicle.status,
                      tone: (vehicle.status === 'maintenance' ? 'warning' : 'danger') as
                        | 'danger'
                        | 'warning',
                    },
                    ...(vehicle.remittanceRiskStatus
                      ? [
                          {
                            label: vehicle.remittanceRiskStatus.replace(/_/g, ' '),
                            tone: 'warning' as const,
                          },
                        ]
                      : []),
                  ]}
                  ctaLabel="View vehicle"
                  href={actionHrefForVehicle(vehicle.id)}
                  key={vehicle.id}
                  subtitle={vehicle.maintenanceSummary}
                  title={vehicle.primaryLabel}
                />
              ))}
            </InsightListCard>
          </div>
        </section>

        {hirePurchaseAssignments.length > 0 ? (
          <section className="space-y-4">
            <SectionHeader
              actionHref="/assignments"
              actionLabel="Open contracts"
              description="Track payoff progress and intervene early when hire purchase collections drift."
              title="Hire Purchase"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                caption="Live hire purchase assignments"
                title="Active contracts"
                value={String(hirePurchaseAssignments.length)}
              />
              <MetricCard
                caption="Outstanding contract balance still to be cleared"
                title="Outstanding balance"
                tone={hirePurchaseOutstandingMinorUnits > 0 ? 'warning' : 'default'}
                value={formatCurrency(hirePurchaseOutstandingMinorUnits, reportingCurrency, locale)}
              />
              <MetricCard
                caption="Contracts already showing overdue behavior"
                title="Default risk"
                tone={hirePurchaseAtRisk.length > 0 ? 'danger' : 'default'}
                value={String(hirePurchaseAtRisk.length)}
              />
            </div>

            <InsightListCard
              description="These contracts need immediate follow-up to protect repayment progress."
              emptyDescription="No active hire purchase contracts are overdue right now."
              emptyTitle="Hire purchase risk is contained"
              title="Contracts at risk"
            >
              {hirePurchaseAtRisk.slice(0, 5).map((assignment) => {
                const driver = driverById.get(assignment.driverId);
                const vehicle = vehicleById.get(assignment.vehicleId);
                const summary = assignment.financialContract?.summary;
                return (
                  <QueueItem
                    badges={[
                      { label: `${summary?.overduePeriods ?? 0} overdue periods`, tone: 'danger' },
                      ...(summary?.outstandingBalanceMinorUnits
                        ? [
                            {
                              label: formatCurrency(
                                summary.outstandingBalanceMinorUnits,
                                assignment.remittanceCurrency ?? reportingCurrency,
                                locale,
                              ),
                              tone: 'warning' as const,
                            },
                          ]
                        : []),
                    ]}
                    ctaLabel="View assignment"
                    href={actionHrefForAssignment(assignment.id)}
                    key={assignment.id}
                    subtitle={`${driver ? `${driver.firstName} ${driver.lastName}`.trim() : 'Driver pending'} • ${vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle pending'}`}
                    title={summary?.riskSignals[0] ?? 'Hire purchase follow-up required'}
                  />
                );
              })}
            </InsightListCard>
          </section>
        ) : null}
      </div>
    </TenantAppShell>
  );
}
