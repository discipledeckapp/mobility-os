import { Permission } from '@mobility-os/authz-model';
import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { PolicyService } from './policy.service';

@ApiTags('Policy')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get('rules')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object, isArray: true })
  listRules(@CurrentTenant() ctx: TenantContext) {
    return this.policyService.listRules(ctx.tenantId);
  }

  @Get('actions')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object, isArray: true })
  listActions(
    @CurrentTenant() ctx: TenantContext,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('status') status?: string,
  ) {
    return this.policyService.listActions(ctx.tenantId, {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(status ? { status } : {}),
    });
  }

  @Get('drivers/:driverId/evaluate')
  @RequirePermissions(Permission.DriversRead)
  @UseGuards(PermissionsGuard)
  @ApiOkResponse({ type: Object, isArray: true })
  evaluateDriver(@CurrentTenant() ctx: TenantContext, @Param('driverId') driverId: string) {
    return this.policyService.evaluateDriverPolicies(ctx.tenantId, driverId);
  }
}
