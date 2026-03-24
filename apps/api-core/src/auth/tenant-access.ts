import type { TenantContext } from '@mobility-os/tenancy-domain';
import { ForbiddenException } from '@nestjs/common';

export function getAssignedFleetIds(ctx: TenantContext): string[] {
  return Array.isArray(ctx.assignedFleetIds)
    ? ctx.assignedFleetIds.filter((value) => value.trim().length > 0).map((value) => value)
    : [];
}

export function getAssignedVehicleIds(ctx: TenantContext): string[] {
  return Array.isArray(ctx.assignedVehicleIds)
    ? ctx.assignedVehicleIds.filter((value) => value.trim().length > 0).map((value) => value)
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

export function applyVehicleScope<T extends object>(
  input: T,
  ctx: TenantContext,
): T & { vehicleId?: string; vehicleIds?: string[] } {
  const assignedVehicleIds = getAssignedVehicleIds(ctx);
  if (assignedVehicleIds.length === 0) {
    return input;
  }

  const vehicleIdCandidate = (input as { vehicleId?: unknown }).vehicleId;
  const vehicleId = typeof vehicleIdCandidate === 'string' ? vehicleIdCandidate : undefined;
  if (vehicleId) {
    if (!assignedVehicleIds.includes(vehicleId)) {
      throw new ForbiddenException('You do not have access to the selected vehicle.');
    }
    return input;
  }

  return {
    ...input,
    vehicleIds: assignedVehicleIds,
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

export function assertVehicleAccess(ctx: TenantContext, vehicleId: string): void {
  const assignedVehicleIds = getAssignedVehicleIds(ctx);
  if (assignedVehicleIds.length === 0) {
    return;
  }

  if (!assignedVehicleIds.includes(vehicleId)) {
    throw new ForbiddenException('You do not have access to this vehicle.');
  }
}
