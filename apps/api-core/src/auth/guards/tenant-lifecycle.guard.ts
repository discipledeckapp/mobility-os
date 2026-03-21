import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { Reflector } from '@nestjs/core';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ControlPlaneLifecycleClient } from '../control-plane-lifecycle.client';
import { ALLOW_BLOCKED_TENANT_ACCESS_KEY } from '../decorators/allow-blocked-tenant-access.decorator';

interface TenantContextRequest {
  method: string;
  tenantContext?: {
    tenantId: string;
  };
}

const READ_ONLY_STATUSES = new Set(['past_due', 'grace_period']);
const BLOCKED_STATUSES = new Set(['suspended', 'terminated', 'archived', 'canceled']);
const READ_ONLY_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class TenantLifecycleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly controlPlaneLifecycleClient: ControlPlaneLifecycleClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowBlockedAccess = this.reflector.getAllAndOverride<boolean>(
      ALLOW_BLOCKED_TENANT_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<TenantContextRequest>();
    const tenantId = request.tenantContext?.tenantId;
    if (!tenantId) {
      return true;
    }

    const localTenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!localTenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    const status = await this.resolveCurrentStatus(tenantId, localTenant.status);
    if (allowBlockedAccess) {
      return true;
    }

    if (BLOCKED_STATUSES.has(status)) {
      throw new ForbiddenException(`Tenant access is blocked while account status is '${status}'`);
    }

    if (READ_ONLY_STATUSES.has(status) && !READ_ONLY_METHODS.has(request.method)) {
      throw new ForbiddenException(
        `Tenant account is '${status}' and currently restricted to read-only access`,
      );
    }

    return true;
  }

  private async resolveCurrentStatus(tenantId: string, fallbackStatus: string): Promise<string> {
    try {
      const remoteState = await this.controlPlaneLifecycleClient.getTenantLifecycleState(tenantId);
      if (remoteState.status !== fallbackStatus) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: { status: remoteState.status },
        });
      }
      return remoteState.status;
    } catch {
      return fallbackStatus;
    }
  }
}
