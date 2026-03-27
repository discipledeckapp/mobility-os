import { type Permission, type TenantRole, getGrantedPermissions } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<Permission[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ tenantContext?: TenantContext }>();
    const role = request.tenantContext?.role;

    if (!role) {
      throw new ForbiddenException('Your role could not be determined for this action.');
    }

    const grantedPermissions = getGrantedPermissions(
      role as TenantRole,
      request.tenantContext?.customPermissions ?? [],
      { linkedDriverId: request.tenantContext?.linkedDriverId ?? null },
    );
    if (grantedPermissions.size === 0) {
      throw new ForbiddenException('Your role is not allowed to perform this action.');
    }

    const isAllowed = requiredPermissions.some((permission) => grantedPermissions.has(permission));

    if (!isAllowed) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true;
  }
}
