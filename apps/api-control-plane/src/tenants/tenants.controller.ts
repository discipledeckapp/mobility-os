import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { TenantDetailDto } from './dto/tenant-detail.dto';
import { TenantListItemDto } from './dto/tenant-list-item.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOkResponse({ type: [TenantListItemDto] })
  listTenants(): Promise<TenantListItemDto[]> {
    return this.tenantsService.listTenants();
  }

  @Get(':tenantId')
  @ApiOkResponse({ type: TenantDetailDto })
  getTenantDetail(@Param('tenantId') tenantId: string): Promise<TenantDetailDto> {
    return this.tenantsService.getTenantDetail(tenantId);
  }
}
