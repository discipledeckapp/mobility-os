import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { ProvisionTenantDto } from './dto/provision-tenant.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ProvisioningService } from './provisioning.service';

@ApiTags('Provisioning')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('provisioning')
export class ProvisioningController {
  constructor(private readonly provisioningService: ProvisioningService) {}

  @Post('tenants')
  @ApiCreatedResponse({ description: 'Tenant provisioning completed' })
  provisionTenant(@Body() dto: ProvisionTenantDto) {
    return this.provisioningService.provisionTenant(dto);
  }
}
