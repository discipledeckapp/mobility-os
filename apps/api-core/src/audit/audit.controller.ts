import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AuditService } from './audit.service';

type AuditQueryDto = PaginationQueryDto & {
  entityType?: string;
  action?: string;
  actorId?: string;
};

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermissions(Permission.AuditRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object })
  listAuditLog(
    @CurrentTenant() ctx: TenantContext,
    @Query() query: AuditQueryDto,
  ): Promise<
    PaginatedResponse<{
      id: string;
      tenantId: string;
      actorId: string | null;
      entityType: string;
      entityId: string;
      action: string;
      beforeState: unknown;
      afterState: unknown;
      metadata: unknown;
      createdAt: string;
    }>
  > {
    return this.auditService.listTenantAuditLog(ctx.tenantId, query).then((result) => ({
      ...result,
      data: result.data.map((item) => ({
        ...item,
        actorId: item.actorId ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
    }));
  }
}
