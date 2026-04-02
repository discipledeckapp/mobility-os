import type { Route } from 'next';
import type { AuditLogRecord } from './api-core';
import { formatAssignmentStatusLabel, getAssignmentDisplayName } from './assignment-display';

export type OperationalActivityKind =
  | 'driver'
  | 'vehicle'
  | 'assignment'
  | 'remittance'
  | 'maintenance'
  | 'inspection'
  | 'incident'
  | 'record';

export type OperationalActivityItem = {
  id: string;
  kind: OperationalActivityKind;
  title: string;
  description: string;
  href: Route;
  timestamp: string;
  status?: string;
};

type ActivityLookups = {
  driverLabels?: Map<string, string>;
  vehicleLabels?: Map<string, string>;
  assignmentLabels?: Map<string, string>;
};

function readString(
  source: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const value = source?.[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readNumber(
  source: Record<string, unknown> | null | undefined,
  key: string,
): number | undefined {
  const value = source?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getActivityKind(entityType: string): OperationalActivityKind {
  if (entityType === 'driver') return 'driver';
  if (entityType === 'vehicle') return 'vehicle';
  if (entityType === 'assignment') return 'assignment';
  if (entityType === 'remittance') return 'remittance';
  if (entityType === 'work_order') return 'maintenance';
  if (entityType === 'inspection') return 'inspection';
  if (entityType === 'vehicle_incident') return 'incident';
  return 'record';
}

function formatActionLabel(action: string): string {
  return action
    .replaceAll('.', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRemittanceDescription(event: AuditLogRecord, locale: string): string {
  const amountMinorUnits =
    readNumber(event.metadata, 'amountMinorUnits') ??
    readNumber(event.afterState, 'amountMinorUnits') ??
    readNumber(event.beforeState, 'amountMinorUnits');
  const currency =
    readString(event.metadata, 'currency') ??
    readString(event.afterState, 'currency') ??
    readString(event.beforeState, 'currency');
  const dueDate = readString(event.metadata, 'dueDate') ?? readString(event.afterState, 'dueDate');

  if (amountMinorUnits != null && currency) {
    const amount = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amountMinorUnits / 100);

    return dueDate ? `${amount} due ${dueDate}` : amount;
  }

  return formatActionLabel(event.action);
}

function getEventHref(event: AuditLogRecord): Route {
  const vehicleId = readString(event.metadata, 'vehicleId');

  switch (event.entityType) {
    case 'driver':
      return `/drivers/${event.entityId}` as Route;
    case 'vehicle':
      return `/vehicles/${event.entityId}` as Route;
    case 'assignment':
      return `/assignments/${event.entityId}` as Route;
    case 'remittance':
      return '/remittance' as Route;
    case 'work_order':
      return vehicleId ? (`/vehicles/${vehicleId}?tab=maintenance` as Route) : ('/vehicles/health' as Route);
    case 'inspection':
      return vehicleId ? (`/vehicles/${vehicleId}?tab=history` as Route) : ('/vehicles/health' as Route);
    case 'vehicle_incident':
      return vehicleId ? (`/vehicles/${vehicleId}?tab=history` as Route) : ('/vehicles' as Route);
    case 'document':
    case 'dispute':
      return '/operations' as Route;
    default:
      return '/audit' as Route;
  }
}

export function buildOperationalActivityItem(
  event: AuditLogRecord,
  locale: string,
  lookups: ActivityLookups = {},
): OperationalActivityItem {
  const driverId = readString(event.metadata, 'driverId');
  const vehicleId = readString(event.metadata, 'vehicleId');
  const assignmentId = readString(event.metadata, 'assignmentId');
  const driverLabel = driverId ? lookups.driverLabels?.get(driverId) : undefined;
  const vehicleLabel = vehicleId ? lookups.vehicleLabels?.get(vehicleId) : undefined;
  const assignmentLabel = assignmentId ? lookups.assignmentLabels?.get(assignmentId) : undefined;
  const titleFromMetadata = readString(event.metadata, 'title');
  const actionLabel = formatActionLabel(event.action);
  const kind = getActivityKind(event.entityType);
  const status =
    readString(event.metadata, 'status') ??
    readString(event.afterState, 'status') ??
    readString(event.beforeState, 'status');
  const withStatus = <T extends Omit<OperationalActivityItem, 'status'>>(
    item: T,
  ): OperationalActivityItem => ({
    ...item,
    ...(status ? { status } : {}),
  });

  if (event.entityType === 'assignment') {
    return withStatus({
      id: event.id,
      kind,
      title:
        assignmentLabel ??
        getAssignmentDisplayName({
          driverLabel,
          vehicleLabel,
          fallbackId: event.entityId,
        }),
      description: actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'remittance') {
    return withStatus({
      id: event.id,
      kind,
      title: driverLabel ? `Remittance for ${driverLabel}` : 'Remittance activity',
      description: getRemittanceDescription(event, locale),
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'vehicle_incident') {
    const incidentTitle = titleFromMetadata ?? 'Vehicle incident reported';
    const subject = [vehicleLabel, driverLabel ? `reported by ${driverLabel}` : null]
      .filter(Boolean)
      .join(' • ');

    return withStatus({
      id: event.id,
      kind,
      title: incidentTitle,
      description: subject || actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'work_order') {
    return withStatus({
      id: event.id,
      kind,
      title: vehicleLabel ? `Maintenance on ${vehicleLabel}` : 'Maintenance activity',
      description: actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'inspection') {
    return withStatus({
      id: event.id,
      kind,
      title: vehicleLabel ? `Inspection for ${vehicleLabel}` : 'Inspection activity',
      description: actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'driver') {
    return withStatus({
      id: event.id,
      kind,
      title: driverLabel ?? 'Driver activity',
      description: actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  if (event.entityType === 'vehicle') {
    return withStatus({
      id: event.id,
      kind,
      title: vehicleLabel ?? 'Vehicle activity',
      description: actionLabel,
      href: getEventHref(event),
      timestamp: event.createdAt,
    });
  }

  return withStatus({
    id: event.id,
    kind,
    title: titleFromMetadata ?? formatAssignmentStatusLabel(event.entityType),
    description: actionLabel,
    href: getEventHref(event),
    timestamp: event.createdAt,
  });
}
