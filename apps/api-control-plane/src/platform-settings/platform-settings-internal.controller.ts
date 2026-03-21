import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalServiceAuthGuard } from '../auth/guards/internal-service-auth.guard';
import {
  type IdentityVerificationRoutingSettingDto,
  IdentityVerificationRoutingSettingKey,
} from './dto/identity-verification-routing.dto';
import {
  type VerificationBillingPolicySettingDto,
  VerificationBillingPolicySettingKey,
} from './dto/verification-billing-policy.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformSettingsService } from './platform-settings.service';

@ApiExcludeController()
@UseGuards(InternalServiceAuthGuard)
@Controller('internal/platform-settings')
export class PlatformSettingsInternalController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get('identity-verification-routing')
  async getIdentityVerificationRouting(): Promise<IdentityVerificationRoutingSettingDto> {
    const setting = await this.platformSettingsService.getSetting(
      IdentityVerificationRoutingSettingKey,
    );
    return setting.value as unknown as IdentityVerificationRoutingSettingDto;
  }

  @Get('verification-billing-policy')
  async getVerificationBillingPolicy(): Promise<VerificationBillingPolicySettingDto> {
    const setting = await this.platformSettingsService.getSetting(
      VerificationBillingPolicySettingKey,
    );
    return setting.value as unknown as VerificationBillingPolicySettingDto;
  }
}
