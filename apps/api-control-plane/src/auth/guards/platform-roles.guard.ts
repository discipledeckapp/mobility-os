import type { PlatformRole } from '@mobility-os/authz-model';
import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { Reflector } from '@nestjs/core';
import { PLATFORM_ROLES_KEY } from '../decorators/require-platform-roles.decorator';
import type { PlatformPrincipal } from './platform-auth.guard';

interface HttpRequestWithPlatformPrincipal {
  platformPrincipal?: PlatformPrincipal;
}

@Injectable()
export class PlatformRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PlatformRole[] | undefined>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HttpRequestWithPlatformPrincipal>();
    const principal = request.platformPrincipal;

    if (!principal || !requiredRoles.includes(principal.role)) {
      throw new ForbiddenException('Your platform role cannot access this resource.');
    }

    return true;
  }
}
