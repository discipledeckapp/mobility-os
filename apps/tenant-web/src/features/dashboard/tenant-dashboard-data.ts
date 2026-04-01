import type { Route } from 'next';
import {
  type AssignmentRecord,
  type DriverRecord,
  type RemittanceRecord,
  type ReportsOverviewRecord,
  type VehicleRecord,
  getTenantApiToken,
  getReportsOverview,
  getTenantMe,
  listAssignments,
  listDrivers,
  listRemittances,
  listVehicles,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { getVehiclePrimaryLabel } from '../../lib/vehicle-display';

export interface DashboardSummaryItem {
  label: string;
  value: string;
  tone: 'neutral' | 'accent' | 'warm';
  detail?: string;
}

export interface DashboardFeatureCard {
  href: Route;
  title: string;
  description: string;
}

export interface DashboardActivityItem {
  id: string;
  kind:
    | 'driver'
    | 'vehicle'
    | 'assignment'
    | 'remittance'
    | 'maintenance'
    | 'inspection'
    | 'incident'
    | 'record';
  title: string;
  description: string;
  href: Route;
  timestamp: string;
  status?: string;
}

export interface DashboardActionItem {
  id: string;
  priority: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  href: Route;
  count?: number;
}

export interface DashboardData {
  summary: DashboardSummaryItem[];
  remittanceSummary: DashboardSummaryItem[];
  recentActivity: DashboardActivityItem[];
  featureCards: DashboardFeatureCard[];
  actionItems: DashboardActionItem[];
  notes: string[];
  isEmpty: boolean;
}

function buildActionItems(
  drivers: DriverRecord[],
  remittances: RemittanceRecord[],
): DashboardActionItem[] {
  const items: DashboardActionItem[] = [];

  const pendingDocDrivers = drivers.filter((d) => d.pendingDocumentCount > 0);
  if (pendingDocDrivers.length > 0) {
    items.push({
      id: 'pending-docs',
      priority: 'warning',
      title: `${pendingDocDrivers.length} driver${pendingDocDrivers.length > 1 ? 's' : ''} with pending document review`,
      description: 'Review and approve uploaded ID documents to unblock driver activation.',
      href: '/drivers?identityStatus=pending_verification',
      count: pendingDocDrivers.length,
    });
  }

  const rejectedDocDrivers = drivers.filter((d) => d.rejectedDocumentCount > 0);
  if (rejectedDocDrivers.length > 0) {
    items.push({
      id: 'rejected-docs',
      priority: 'critical',
      title: `${rejectedDocDrivers.length} driver${rejectedDocDrivers.length > 1 ? 's' : ''} with rejected documents`,
      description: 'Rejected documents need driver re-upload before onboarding can continue.',
      href: '/drivers',
      count: rejectedDocDrivers.length,
    });
  }

  const unverifiedDrivers = drivers.filter(
    (d) => d.status === 'active' && d.identityStatus === 'unverified',
  );
  if (unverifiedDrivers.length > 0) {
    items.push({
      id: 'unverified',
      priority: 'warning',
      title: `${unverifiedDrivers.length} active driver${unverifiedDrivers.length > 1 ? 's' : ''} not yet verified`,
      description: 'Identity verification is incomplete for these active drivers.',
      href: '/drivers?status=active&identityStatus=unverified',
      count: unverifiedDrivers.length,
    });
  }

  const reviewNeeded = drivers.filter((d) => d.identityStatus === 'review_needed');
  if (reviewNeeded.length > 0) {
    items.push({
      id: 'review-needed',
      priority: 'critical',
      title: `${reviewNeeded.length} identity review${reviewNeeded.length > 1 ? 's' : ''} open`,
      description: 'These drivers have flagged identity cases waiting for manual review.',
      href: '/drivers?identityStatus=review_needed',
      count: reviewNeeded.length,
    });
  }

  const crossRoleConflicts = drivers.filter((d) => d.guarantorIsAlsoDriver);
  if (crossRoleConflicts.length > 0) {
    items.push({
      id: 'cross-role',
      priority: 'critical',
      title: `${crossRoleConflicts.length} cross-role conflict${crossRoleConflicts.length > 1 ? 's' : ''} detected`,
      description: 'A guarantor is also registered as a driver — review both records.',
      href: '/drivers',
      count: crossRoleConflicts.length,
    });
  }

  const overdueRemittances = remittances.filter((r) => r.status === 'overdue');
  if (overdueRemittances.length > 0) {
    items.push({
      id: 'overdue-remittance',
      priority: 'critical',
      title: `${overdueRemittances.length} overdue remittance${overdueRemittances.length > 1 ? 's' : ''}`,
      description: 'Collect outstanding overdue payments before they affect driver standing.',
      href: '/remittance',
      count: overdueRemittances.length,
    });
  }

  const missingGuarantors = drivers.filter(
    (d) => d.status === 'active' && !d.hasGuarantor,
  );
  if (missingGuarantors.length > 0) {
    items.push({
      id: 'missing-guarantors',
      priority: 'info',
      title: `${missingGuarantors.length} active driver${missingGuarantors.length > 1 ? 's' : ''} without a guarantor`,
      description: 'Guarantors strengthen your risk coverage — add one for each active driver.',
      href: '/drivers?status=active',
      count: missingGuarantors.length,
    });
  }

  // Sort: critical first, then warning, then info
  const order = { critical: 0, warning: 1, info: 2 };
  return items.sort((a, b) => order[a.priority] - order[b.priority]);
}

function getEmptyDashboardData(): DashboardData {
  return {
    summary: [
      { label: 'Total drivers', value: '0', tone: 'neutral', detail: 'No records yet' },
      { label: 'Active drivers', value: '0', tone: 'neutral', detail: 'No active drivers yet' },
      { label: 'Total vehicles', value: '0', tone: 'neutral', detail: 'No vehicles yet' },
      { label: 'Active assignments', value: '0', tone: 'neutral', detail: 'No assignments yet' },
      { label: 'Pending remittances', value: '0', tone: 'neutral', detail: 'No open remittance' },
    ],
    remittanceSummary: [
      {
        label: 'Recorded remittance',
        value: 'None',
        tone: 'neutral',
        detail: 'No remittance records yet',
      },
      {
        label: 'Confirmed remittance',
        value: 'None',
        tone: 'neutral',
        detail: 'No settled remittance yet',
      },
      { label: 'Open remittance', value: 'None', tone: 'neutral', detail: 'No open remittance' },
    ],
    recentActivity: [],
    featureCards: getDashboardFeatureCards(),
    actionItems: [],
    notes: [],
    isEmpty: true,
  };
}

function formatCurrencyTotals(
  records: RemittanceRecord[],
  locale: string,
  status?: string,
): string {
  const totals = new Map<string, number>();

  for (const record of records) {
    if (status && record.status !== status) {
      continue;
    }

    totals.set(record.currency, (totals.get(record.currency) ?? 0) + record.amountMinorUnits);
  }

  if (totals.size === 0) {
    return 'None';
  }

  return [...totals.entries()]
    .map(([currency, amountMinorUnits]) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
      }).format(amountMinorUnits / 100),
    )
    .join(' • ');
}

function getDashboardFeatureCards(): DashboardFeatureCard[] {
  return [
    {
      href: '/drivers',
      title: 'Drivers',
      description: 'Register drivers, track verification, and manage driver status.',
    },
    {
      href: '/vehicles',
      title: 'Vehicles',
      description: 'Manage vehicle records, fleet placement, and operating status.',
    },
    {
      href: '/assignments',
      title: 'Assignments',
      description: 'Match drivers to vehicles and track assignment progress.',
    },
    {
      href: '/remittance',
      title: 'Remittance',
      description: 'Record collections and monitor outstanding remittance items.',
    },
    {
      href: '/reports',
      title: 'Insights',
      description: 'Review remittance health, readiness blockers, utilization gaps, and fleet risk.',
    },
    {
      href: '/records' as Route,
      title: 'Records',
      description: 'Inspect generated documents, dispute history, and operational audit evidence.',
    },
  ];
}

function buildFallbackRecentActivity(
  assignments: AssignmentRecord[],
  remittances: RemittanceRecord[],
  drivers: DriverRecord[],
  vehicles: VehicleRecord[],
): DashboardActivityItem[] {
  const driverLabels = new Map(
    drivers.map((driver) => [driver.id, `${driver.firstName} ${driver.lastName}`.trim()]),
  );
  const vehicleLabels = new Map(
    vehicles.map((vehicle) => [vehicle.id, getVehiclePrimaryLabel(vehicle)]),
  );

  const assignmentItems: DashboardActivityItem[] = assignments.map((assignment) => ({
    id: `assignment-${assignment.id}`,
    kind: 'assignment',
    title: 'Assignment updated',
    description: `${driverLabels.get(assignment.driverId) ?? 'Driver'} • ${vehicleLabels.get(assignment.vehicleId) ?? 'Vehicle'} • ${assignment.status.replace(/_/g, ' ')}`,
    href: '/assignments',
    timestamp: assignment.updatedAt,
    status: assignment.status,
  }));
  const remittanceItems: DashboardActivityItem[] = remittances.map((remittance) => ({
    id: `remittance-${remittance.id}`,
    kind: 'remittance',
    title: 'Remittance recorded',
    description: `${remittance.currency} ${remittance.amountMinorUnits / 100} • ${remittance.status.replace(/_/g, ' ')}`,
    href: '/remittance',
    timestamp: remittance.updatedAt,
    status: remittance.status,
  }));

  return [...assignmentItems, ...remittanceItems]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 6);
}

export async function getDashboardData(explicitToken?: string): Promise<DashboardData> {
  const settle = async <T>(loader: () => Promise<T>): Promise<T> => loader();
  const notes: string[] = [];
  const appendAvailabilityNote = (surface: string) => {
    notes.push(`${surface} is still syncing, so this dashboard is showing the latest confirmed data we could load.`);
  };

  const token = await getTenantApiToken(explicitToken).catch(() => explicitToken);
  const tenant = await getTenantMe(token).catch(() => null);
  const locale = getFormattingLocale(tenant?.country);

  const [driversResult, vehiclesResult, assignmentsResult, remittancesResult] =
    await Promise.allSettled([
      settle(() => listDrivers({ limit: 200 }, token)),
      settle(() => listVehicles({ limit: 200 }, token)),
      settle(() => listAssignments({ limit: 200 }, token)),
      settle(() => listRemittances({ limit: 200 }, token)),
    ]);
  const overviewResult = await Promise.resolve()
    .then(() => getReportsOverview({}, token))
    .catch((error) => error as Error);

  const results = [driversResult, vehiclesResult, assignmentsResult, remittancesResult];

  if (results.every((result) => result.status === 'rejected')) {
    const rejectionMessages = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) =>
        result.reason instanceof Error ? result.reason.message : String(result.reason),
      );

    if (
      rejectionMessages.length > 0 &&
      rejectionMessages.every(
        (message) =>
          message.includes('TENANT_API_TOKEN is not configured') ||
          message.includes('No tenant auth token is available'),
      )
    ) {
      return getEmptyDashboardData();
    }

    return getEmptyDashboardData();
  }

  const drivers = driversResult.status === 'fulfilled' ? driversResult.value.data : [];
  const vehicles = vehiclesResult.status === 'fulfilled' ? vehiclesResult.value.data : [];
  const assignments = assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data : [];
  const remittances = remittancesResult.status === 'fulfilled' ? remittancesResult.value.data : [];
  const totalDrivers = driversResult.status === 'fulfilled' ? driversResult.value.total : 0;

  if (driversResult.status === 'rejected') {
    appendAvailabilityNote('Driver');
  }

  if (vehiclesResult.status === 'rejected') {
    appendAvailabilityNote('Vehicle');
  }

  if (assignmentsResult.status === 'rejected') {
    appendAvailabilityNote('Assignment');
  }

  if (remittancesResult.status === 'rejected') {
    appendAvailabilityNote('Remittance');
  }

  if (overviewResult instanceof Error) {
    appendAvailabilityNote('Remittance forecast');
  }

  const verifiedActiveDrivers = drivers.filter(
    (driver) => driver.status === 'active' && driver.identityStatus === 'verified',
  ).length;
  const onboardingPoolCount = drivers.filter(
    (driver) => driver.identityStatus !== 'verified',
  ).length;
  const totalVehicles = vehicles.length;
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === 'active',
  ).length;
  const assignedAssignments = assignments.filter(
    (assignment) =>
      assignment.status === 'pending_driver_confirmation' ||
      assignment.status === 'driver_action_required' ||
      assignment.status === 'accepted' ||
      assignment.status === 'created',
  ).length;
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'ended',
  ).length;
  const pendingRemittances = remittances.filter((remittance) => remittance.status === 'pending');
  const confirmedRemittances = remittances.filter(
    (remittance) => remittance.status === 'completed' || remittance.status === 'partially_settled',
  );
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'available').length;
  const projection = overviewResult instanceof Error ? null : (overviewResult as ReportsOverviewRecord).remittanceProjection;

  return {
    summary: [
      {
        label: 'Total drivers',
        value: String(totalDrivers),
        tone: totalDrivers > 0 ? 'accent' : 'neutral',
        detail: `${onboardingPoolCount} still onboarding`,
      },
      {
        label: 'Active drivers',
        value: String(verifiedActiveDrivers),
        tone: verifiedActiveDrivers > 0 ? 'accent' : 'warm',
        detail: `${onboardingPoolCount} unverified or incomplete`,
      },
      {
        label: 'Total vehicles',
        value: String(totalVehicles),
        tone: totalVehicles > 0 ? 'accent' : 'neutral',
        detail: `${availableVehicles} available`,
      },
      {
        label: 'Active assignments',
        value: String(activeAssignments),
        tone: activeAssignments > 0 ? 'accent' : 'neutral',
        detail: `${assignedAssignments} pending confirmation • ${completedAssignments} ended`,
      },
      {
        label: 'Pending remittances',
        value: String(pendingRemittances.length),
        tone: pendingRemittances.length > 0 ? 'warm' : 'neutral',
        detail:
          pendingRemittances.length > 0
            ? formatCurrencyTotals(remittances, locale, 'pending')
            : 'No open remittance',
      },
    ],
    remittanceSummary: [
      {
        label: 'Recorded remittance',
        value: formatCurrencyTotals(remittances, locale),
        tone: remittances.length > 0 ? 'accent' : 'neutral',
        detail: `${remittances.length} total records`,
      },
      {
        label: 'Settled remittance',
        value: formatCurrencyTotals(remittances, locale, 'completed'),
        tone: confirmedRemittances.length > 0 ? 'accent' : 'neutral',
        detail: `${confirmedRemittances.length} settled`,
      },
      {
        label: 'Open remittance',
        value: formatCurrencyTotals(remittances, locale, 'pending'),
        tone: pendingRemittances.length > 0 ? 'warm' : 'neutral',
        detail: `${pendingRemittances.length} pending`,
      },
      {
        label: 'Expected this week',
        value: projection
          ? new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: projection.currency,
              minimumFractionDigits: 2,
            }).format(projection.expectedThisWeekMinorUnits / 100)
          : 'Unavailable',
        tone: projection && projection.expectedThisWeekMinorUnits > 0 ? 'accent' : 'neutral',
        detail: projection
          ? `${projection.activeAssignmentsWithPlans} assignments with remittance plans`
          : 'Projection unavailable',
      },
      {
        label: 'At risk',
        value: projection
          ? new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: projection.currency,
              minimumFractionDigits: 2,
            }).format(projection.atRiskMinorUnits / 100)
          : 'Unavailable',
        tone: projection && projection.atRiskMinorUnits > 0 ? 'warm' : 'neutral',
        detail: projection
          ? projection.atRiskAssignmentCount > 0
            ? `${projection.atRiskAssignmentCount} assignments currently at risk`
            : 'No remittance risk detected'
          : 'Projection unavailable',
      },
    ],
    recentActivity:
      !(overviewResult instanceof Error) && (overviewResult as ReportsOverviewRecord).recentActivity.length > 0
        ? (overviewResult as ReportsOverviewRecord).recentActivity.map((item) => ({
            id: item.id,
            kind: item.kind as DashboardActivityItem['kind'],
            title: item.title,
            description: item.description,
            href: item.href as Route,
            timestamp: item.timestamp,
            status: item.status,
          }))
        : buildFallbackRecentActivity(assignments, remittances, drivers, vehicles),
    featureCards: getDashboardFeatureCards(),
    actionItems: buildActionItems(drivers, remittances),
    notes,
    isEmpty:
      drivers.length === 0 &&
      vehicles.length === 0 &&
      assignments.length === 0 &&
      remittances.length === 0,
  };
}
