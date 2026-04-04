import {
  asTenantId,
  assertTenantOwnership,
  hasTenantOwnership,
  tenantContextFromJwt,
} from './index';

describe('tenancy-domain', () => {
  describe('tenantContextFromJwt', () => {
    it('builds a tenant context from a valid JWT payload', () => {
      const context = tenantContextFromJwt({
        tenantId: 'tenant_1',
        sub: 'user_1',
        role: 'tenant_admin',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        assignedFleetIds: ['fleet_1', '', 'fleet_2'],
        assignedVehicleIds: ['vehicle_1', '', 'vehicle_2'],
        customPermissions: ['remittance:read', '', 'drivers:write'],
        linkedDriverId: 'driver_1',
        mobileRole: 'driver',
      });

      expect(context).toEqual({
        tenantId: 'tenant_1',
        userId: 'user_1',
        role: 'tenant_admin',
        businessEntityId: 'be_1',
        operatingUnitId: 'ou_1',
        assignedFleetIds: ['fleet_1', 'fleet_2'],
        assignedVehicleIds: ['vehicle_1', 'vehicle_2'],
        customPermissions: ['remittance:read', 'drivers:write'],
        linkedDriverId: 'driver_1',
        mobileRole: 'driver',
      });
    });

    it('throws for invalid payloads missing required claims', () => {
      expect(() => tenantContextFromJwt({ tenantId: 'tenant_1', sub: 'user_1' })).toThrow(
        'Invalid JWT payload',
      );
    });
  });

  describe('tenant ownership', () => {
    it('returns true for matching tenant ids', () => {
      expect(hasTenantOwnership(asTenantId('tenant_1'), asTenantId('tenant_1'))).toBe(true);
    });

    it('throws when tenant ownership assertion fails', () => {
      expect(() =>
        assertTenantOwnership(asTenantId('tenant_1'), asTenantId('tenant_2')),
      ).toThrow('Tenant ownership assertion failed');
    });
  });
});
