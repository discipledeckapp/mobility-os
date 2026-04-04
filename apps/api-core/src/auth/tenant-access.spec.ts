import { ForbiddenException } from '@nestjs/common';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  applyFleetScope,
  applyLinkedDriverScope,
  applyVehicleScope,
  assertFleetAccess,
  assertLinkedAssignmentAccess,
  assertLinkedDriverAccess,
  assertNoLinkedDriverMutation,
  assertVehicleAccess,
  getAssignedFleetIds,
  getAssignedVehicleIds,
  getLinkedDriverId,
} from './tenant-access';

describe('tenant-access helpers', () => {
  const fleetIds = (...ids: string[]) => ids as NonNullable<TenantContext['assignedFleetIds']>;
  const vehicleIds = (...ids: string[]) =>
    ids as NonNullable<TenantContext['assignedVehicleIds']>;

  const tenantContext = (overrides: Partial<TenantContext> = {}): TenantContext => ({
    tenantId: 'tenant_1' as TenantContext['tenantId'],
    userId: 'user_1',
    role: 'tenant_admin',
    ...overrides,
  });

  describe('linked driver access', () => {
    it('returns the linked driver id when present', () => {
      expect(getLinkedDriverId(tenantContext({ linkedDriverId: 'driver_1' }))).toBe('driver_1');
    });

    it('throws when a linked session accesses another driver', () => {
      expect(() =>
        assertLinkedDriverAccess(tenantContext({ linkedDriverId: 'driver_1' }), 'driver_2'),
      ).toThrow(ForbiddenException);
    });

    it('throws when a linked session accesses another assignment driver', () => {
      expect(() =>
        assertLinkedAssignmentAccess(tenantContext({ linkedDriverId: 'driver_1' }), 'driver_2'),
      ).toThrow(ForbiddenException);
    });

    it('scopes driver queries to the linked driver', () => {
      expect(applyLinkedDriverScope({}, tenantContext({ linkedDriverId: 'driver_1' }))).toEqual({
        driverId: 'driver_1',
      });
    });

    it('blocks driver-linked mutation paths', () => {
      expect(() =>
        assertNoLinkedDriverMutation(tenantContext({ linkedDriverId: 'driver_1' }), 'create fleets'),
      ).toThrow('Driver-linked sessions cannot create fleets.');
    });
  });

  describe('fleet and vehicle access', () => {
    it('returns trimmed assigned fleet ids', () => {
      const ctx = tenantContext({
        assignedFleetIds: fleetIds('fleet_1', '', 'fleet_2'),
      });
      expect(getAssignedFleetIds(ctx)).toEqual(['fleet_1', 'fleet_2']);
    });

    it('returns trimmed assigned vehicle ids', () => {
      const ctx = tenantContext({
        assignedVehicleIds: vehicleIds('vehicle_1', '', 'vehicle_2'),
      });
      expect(getAssignedVehicleIds(ctx)).toEqual(['vehicle_1', 'vehicle_2']);
    });

    it('applies fleet scope when the session is fleet-restricted', () => {
      const ctx = tenantContext({
        assignedFleetIds: fleetIds('fleet_1', 'fleet_2'),
      });

      expect(applyFleetScope({}, ctx)).toEqual({ fleetIds: ['fleet_1', 'fleet_2'] });
    });

    it('rejects queries for unassigned fleets', () => {
      const ctx = tenantContext({
        assignedFleetIds: fleetIds('fleet_1'),
      });

      expect(() => applyFleetScope({ fleetId: 'fleet_2' }, ctx)).toThrow(ForbiddenException);
      expect(() => assertFleetAccess(ctx, 'fleet_2')).toThrow(ForbiddenException);
    });

    it('applies vehicle scope when the session is vehicle-restricted', () => {
      const ctx = tenantContext({
        assignedVehicleIds: vehicleIds('vehicle_1', 'vehicle_2'),
      });

      expect(applyVehicleScope({}, ctx)).toEqual({
        vehicleIds: ['vehicle_1', 'vehicle_2'],
      });
    });

    it('rejects access to unassigned vehicles', () => {
      const ctx = tenantContext({
        assignedVehicleIds: vehicleIds('vehicle_1'),
      });

      expect(() => applyVehicleScope({ vehicleId: 'vehicle_2' }, ctx)).toThrow(
        ForbiddenException,
      );
      expect(() => assertVehicleAccess(ctx, 'vehicle_2')).toThrow(ForbiddenException);
    });
  });
});
