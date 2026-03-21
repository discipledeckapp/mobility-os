import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiTags } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ProvisionTenantDto } from './dto/provision-tenant.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { InternalProvisioningService } from './internal-provisioning.service';

@ApiTags('Internal Provisioning')
@ApiHeader({
  name: 'x-internal-service-token',
  required: true,
  description: 'Internal service token shared between platform services',
})
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/provisioning')
export class InternalProvisioningController {
  constructor(private readonly internalProvisioningService: InternalProvisioningService) {}

  @Post('tenant-setup')
  @ApiCreatedResponse({ description: 'Tenant provisioning completed' })
  provisionTenant(@Body() dto: ProvisionTenantDto) {
    return this.internalProvisioningService.provisionTenant(dto);
  }
}
