import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
import { InternalTenantOwnerSummaryDto } from '../tenants/dto/internal-tenant-owner-summary.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantsService } from '../tenants/tenants.service';

@ApiTags('Internal Tenants')
@ApiHeader({
  name: 'x-internal-service-token',
  required: true,
  description: 'Internal service token shared between platform services',
})
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/tenants')
export class InternalTenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOkResponse({ description: 'All tenants for internal platform consumers' })
  list() {
    return this.tenantsService.listAll();
  }

  @Get(':tenantId')
  @ApiOkResponse({ description: 'Single tenant for internal platform consumers' })
  findOne(@Param('tenantId') tenantId: string) {
    return this.tenantsService.findById(tenantId);
  }

  @Get(':tenantId/owner-summary')
  @ApiOkResponse({ type: InternalTenantOwnerSummaryDto })
  ownerSummary(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getOwnerSummary(tenantId);
  }
}
