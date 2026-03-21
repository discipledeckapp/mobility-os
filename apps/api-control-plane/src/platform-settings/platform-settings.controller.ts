import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { IdentityVerificationRoutingSettingDto } from './dto/identity-verification-routing.dto';
import { PlatformSettingResponseDto } from './dto/platform-setting-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpsertPlatformSettingDto } from './dto/upsert-platform-setting.dto';
import { VerificationBillingPolicySettingDto } from './dto/verification-billing-policy.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformSettingsService } from './platform-settings.service';

@ApiTags('Platform Settings')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  @ApiOkResponse({ type: [PlatformSettingResponseDto] })
  listSettings(): Promise<PlatformSettingResponseDto[]> {
    return this.platformSettingsService.listSettings();
  }

  @Get('examples/identity-verification-routing')
  @ApiOkResponse({ type: IdentityVerificationRoutingSettingDto })
  getIdentityVerificationRoutingExample(): IdentityVerificationRoutingSettingDto {
    return {
      countries: [
        {
          countryCode: 'NG',
          livenessProviders: [
            {
              name: 'amazon_rekognition',
              enabled: true,
              priority: 1,
            },
            {
              name: 'youverify',
              enabled: true,
              priority: 2,
            },
            {
              name: 'smile_identity',
              enabled: true,
              priority: 3,
            },
          ],
          lookupProviders: [
            {
              name: 'youverify',
              enabled: true,
              priority: 1,
              allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
            },
            {
              name: 'smile_identity',
              enabled: true,
              priority: 2,
              allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID'],
            },
          ],
          fallbackOnProviderError: true,
          fallbackOnProviderUnavailable: true,
          fallbackOnNoMatch: false,
        },
      ],
    };
  }

  @Get('examples/verification-billing-policy')
  @ApiOkResponse({ type: VerificationBillingPolicySettingDto })
  getVerificationBillingPolicyExample(): VerificationBillingPolicySettingDto {
    return {
      countries: [
        {
          countryCode: 'NG',
          enabled: true,
          meterEventType: 'identity_verification',
          defaultFeeMinorUnits: 15000,
          billOnStatuses: ['verified', 'no_match', 'provider_error'],
          providers: [
            {
              name: 'youverify',
              enabled: true,
              feeMinorUnits: 15000,
            },
            {
              name: 'smile_identity',
              enabled: true,
              feeMinorUnits: 15000,
            },
          ],
        },
      ],
    };
  }

  @Get(':key')
  @ApiOkResponse({ type: PlatformSettingResponseDto })
  getSetting(@Param('key') key: string): Promise<PlatformSettingResponseDto> {
    return this.platformSettingsService.getSetting(key);
  }

  @Put(':key')
  @ApiOkResponse({ type: PlatformSettingResponseDto })
  upsertSetting(
    @Param('key') key: string,
    @Body() dto: UpsertPlatformSettingDto,
  ): Promise<PlatformSettingResponseDto> {
    return this.platformSettingsService.upsertSetting({
      ...dto,
      key,
    });
  }
}
