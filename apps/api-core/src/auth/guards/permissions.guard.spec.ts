import { Permission, TenantRole } from '@mobility-os/authz-model';
import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  function createContext(role?: string): ExecutionContext {
    return {
      getClass: jest.fn(),
      getHandler: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          tenantContext: role ? { role } : undefined,
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows requests when no permissions are required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(guard.canActivate(createContext(TenantRole.ReadOnly))).toBe(true);
  });

  it('allows roles that have one of the required permissions', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Permission.GuarantorsWrite]),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(guard.canActivate(createContext(TenantRole.FleetManager))).toBe(true);
  });

  it('blocks roles that do not have the required permission', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Permission.GuarantorsWrite]),
    } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);

    expect(() => guard.canActivate(createContext(TenantRole.ReadOnly))).toThrow(ForbiddenException);
  });
});
