import type { TenantContext } from '@mobility-os/tenancy-domain';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AllowBlockedTenantAccess } from '../auth/decorators/allow-blocked-tenant-access.decorator';
import { CurrentTenant } from '../auth/decorators/tenant-context.decorator';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
import { TenantResponseDto } from './dto/tenant-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Returns the authenticated tenant's own record.
   * Tenants can only access their own data — no tenantId path param is exposed.
   */
  @Get('me')
  @AllowBlockedTenantAccess()
  @ApiOkResponse({ type: TenantResponseDto })
  async getMe(@CurrentTenant() ctx: TenantContext): Promise<TenantResponseDto> {
    const tenant = await this.tenantsService.findById(ctx.tenantId);

    return {
      ...tenant,
      metadata:
        tenant.metadata !== null && typeof tenant.metadata === 'object'
          ? (tenant.metadata as Record<string, unknown>)
          : null,
    };
  }
}
