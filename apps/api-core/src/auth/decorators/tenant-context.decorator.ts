import type { TenantContext } from '@mobility-os/tenancy-domain';
import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * Extracts the TenantContext attached by TenantAuthGuard from the request.
 *
 * Usage:
 *   @Get('me')
 *   @UseGuards(TenantAuthGuard)
 *   getMe(@CurrentTenant() ctx: TenantContext) { ... }
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<{
      tenantContext: TenantContext;
    }>();
    return request.tenantContext;
  },
);
