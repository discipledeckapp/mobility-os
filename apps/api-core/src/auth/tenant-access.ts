import type { TenantContext } from '@mobility-os/tenancy-domain';
import { ForbiddenException } from '@nestjs/common';

export function getAssignedFleetIds(ctx: TenantContext): string[] {
  return Array.isArray(ctx.assignedFleetIds)
    ? ctx.assignedFleetIds.filter((value) => value.trim().length > 0).map((value) => value)
    : [];
}

export function applyFleetScope<T extends object>(
  input: T,
  ctx: TenantContext,
): T & { fleetId?: string; fleetIds?: string[] } {
  const assignedFleetIds = getAssignedFleetIds(ctx);
  if (assignedFleetIds.length === 0) {
    return input;
  }

  const fleetIdCandidate = (input as { fleetId?: unknown }).fleetId;
  const fleetId = typeof fleetIdCandidate === 'string' ? fleetIdCandidate : undefined;
  if (fleetId) {
    if (!assignedFleetIds.includes(fleetId)) {
      throw new ForbiddenException('You do not have access to the selected fleet.');
    }
    return input;
  }

  return {
    ...input,
    fleetIds: assignedFleetIds,
  };
}

export function assertFleetAccess(ctx: TenantContext, fleetId: string): void {
  const assignedFleetIds = getAssignedFleetIds(ctx);
  if (assignedFleetIds.length === 0) {
    return;
  }

  if (!assignedFleetIds.includes(fleetId)) {
    throw new ForbiddenException('You do not have access to this fleet.');
  }
}
