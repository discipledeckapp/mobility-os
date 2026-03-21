import type { Route } from 'next';
import {
  type AssignmentRecord,
  type DriverRecord,
  type RemittanceRecord,
  type VehicleRecord,
  getTenantMe,
  listAssignments,
  listDrivers,
  listRemittances,
  listVehicles,
} from '../../lib/api-core';
import { getFormattingLocale } from '../../lib/locale';
import { getVehiclePrimaryLabel, getVehicleSecondaryLabel } from '../../lib/vehicle-display';

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
  kind: 'driver' | 'vehicle' | 'assignment' | 'remittance';
  title: string;
  description: string;
  href: Route;
  timestamp: string;
  status?: string;
}

export interface DashboardData {
  summary: DashboardSummaryItem[];
  remittanceSummary: DashboardSummaryItem[];
  recentActivity: DashboardActivityItem[];
  featureCards: DashboardFeatureCard[];
  notes: string[];
  isEmpty: boolean;
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
        detail: 'No confirmed remittance yet',
      },
      { label: 'Open remittance', value: 'None', tone: 'neutral', detail: 'No open remittance' },
    ],
    recentActivity: [],
    featureCards: getDashboardFeatureCards(),
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
      href: '/reports/readiness',
      title: 'Reports',
      description: 'Review driver readiness, licence expiry, and vehicle maintenance posture.',
    },
  ];
}

function buildRecentActivity(
  locale: string,
  drivers: DriverRecord[],
  vehicles: VehicleRecord[],
  assignments: AssignmentRecord[],
  remittances: RemittanceRecord[],
): DashboardActivityItem[] {
  const driverLabels = new Map(
    drivers.map((driver) => [driver.id, `${driver.firstName} ${driver.lastName}`]),
  );
  const vehicleLabels = new Map(
    vehicles.map((vehicle) => [
      vehicle.id,
      `${getVehiclePrimaryLabel(vehicle)} • ${getVehicleSecondaryLabel(vehicle)}`,
    ]),
  );

  const items: DashboardActivityItem[] = [
    ...drivers.map((driver) => ({
      id: `driver:${driver.id}`,
      kind: 'driver' as const,
      title: `${driver.firstName} ${driver.lastName}`,
      description: `Driver added to fleet ${driver.fleetId}`,
      href: '/drivers' as const,
      timestamp: driver.createdAt,
      status: driver.status,
    })),
    ...vehicles.map((vehicle) => ({
      id: `vehicle:${vehicle.id}`,
      kind: 'vehicle' as const,
      title: getVehiclePrimaryLabel(vehicle),
      description: `${getVehicleSecondaryLabel(vehicle)} added to fleet ${vehicle.fleetId}`,
      href: `/vehicles/${vehicle.id}` as Route,
      timestamp: vehicle.createdAt,
      status: vehicle.status,
    })),
    ...assignments.map((assignment) => ({
      id: `assignment:${assignment.id}`,
      kind: 'assignment' as const,
      title: driverLabels.get(assignment.driverId) ?? assignment.driverId,
      description: `Assigned to ${vehicleLabels.get(assignment.vehicleId) ?? assignment.vehicleId}`,
      href: '/assignments' as const,
      timestamp: assignment.createdAt,
      status: assignment.status,
    })),
    ...remittances.map((remittance) => ({
      id: `remittance:${remittance.id}`,
      kind: 'remittance' as const,
      title: driverLabels.get(remittance.driverId) ?? remittance.driverId,
      description: `${new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: remittance.currency,
        minimumFractionDigits: 2,
      }).format(remittance.amountMinorUnits / 100)} due ${remittance.dueDate}`,
      href: '/remittance' as const,
      timestamp: remittance.createdAt,
      status: remittance.status,
    })),
  ];

  return items
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 6);
}

export async function getDashboardData(): Promise<DashboardData> {
  const settle = async <T>(loader: () => Promise<T>): Promise<T> => loader();

  const tenant = await getTenantMe().catch(() => null);
  const locale = getFormattingLocale(tenant?.country);

  const [driversResult, vehiclesResult, assignmentsResult, remittancesResult] =
    await Promise.allSettled([
      settle(() => listDrivers({ limit: 200 })),
      settle(() => listVehicles({ limit: 200 })),
      settle(() => listAssignments({ limit: 200 })),
      settle(() => listRemittances({ limit: 200 })),
    ]);

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

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((driver) => driver.status === 'active').length;
  const totalVehicles = vehicles.length;
  const activeAssignments = assignments.filter(
    (assignment) => assignment.status === 'active',
  ).length;
  const assignedAssignments = assignments.filter(
    (assignment) => assignment.status === 'assigned' || assignment.status === 'created',
  ).length;
  const completedAssignments = assignments.filter(
    (assignment) => assignment.status === 'completed',
  ).length;
  const pendingRemittances = remittances.filter((remittance) => remittance.status === 'pending');
  const confirmedRemittances = remittances.filter(
    (remittance) => remittance.status === 'confirmed',
  );
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'available').length;

  return {
    summary: [
      {
        label: 'Total drivers',
        value: String(totalDrivers),
        tone: totalDrivers > 0 ? 'accent' : 'neutral',
        detail: `${activeDrivers} active`,
      },
      {
        label: 'Active drivers',
        value: String(activeDrivers),
        tone: activeDrivers > 0 ? 'accent' : 'warm',
        detail: `${totalDrivers - activeDrivers} not active`,
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
        detail: `${assignedAssignments} reserved • ${completedAssignments} completed`,
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
        label: 'Confirmed remittance',
        value: formatCurrencyTotals(remittances, locale, 'confirmed'),
        tone: confirmedRemittances.length > 0 ? 'accent' : 'neutral',
        detail: `${confirmedRemittances.length} confirmed`,
      },
      {
        label: 'Open remittance',
        value: formatCurrencyTotals(remittances, locale, 'pending'),
        tone: pendingRemittances.length > 0 ? 'warm' : 'neutral',
        detail: `${pendingRemittances.length} pending`,
      },
    ],
    recentActivity: buildRecentActivity(locale, drivers, vehicles, assignments, remittances),
    featureCards: getDashboardFeatureCards(),
    notes: [],
    isEmpty:
      drivers.length === 0 &&
      vehicles.length === 0 &&
      assignments.length === 0 &&
      remittances.length === 0,
  };
}
