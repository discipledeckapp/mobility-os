import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
import {
  type IdentityVerificationRoutingSetting,
  IdentityVerificationRoutingSettingKey,
} from './dto/identity-verification-routing.dto';
import {
  type VerificationBillingPolicySetting,
  VerificationBillingPolicySettingKey,
} from './dto/verification-billing-policy.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlatformSettingsService } from './platform-settings.service';

function getDefaultIdentityVerificationRouting(): IdentityVerificationRoutingSetting {
  return {
    countries: [
      {
        countryCode: 'NG',
        livenessProviders: [{ name: 'youverify', enabled: true, priority: 1 }],
        lookupProviders: [
          {
            name: 'youverify',
            enabled: true,
            priority: 1,
            allowedIdentifierTypes: ['NATIONAL_ID', 'BANK_ID', 'DRIVERS_LICENSE'],
          },
        ],
        fallbackOnProviderError: true,
        fallbackOnProviderUnavailable: true,
        fallbackOnNoMatch: false,
      },
    ],
  };
}

function getDefaultVerificationBillingPolicy(): VerificationBillingPolicySetting {
  return {
    countries: [
      {
        countryCode: 'NG',
        enabled: true,
        meterEventType: 'identity_verification',
        defaultFeeMinorUnits: 15000,
        billOnStatuses: ['verified', 'no_match', 'provider_error'],
        providers: [{ name: 'youverify', enabled: true, feeMinorUnits: 15000 }],
      },
    ],
  };
}

@Injectable()
export class PlatformSettingsBootstrap implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const shouldBootstrap = this.configService.get<boolean>('BOOTSTRAP_DEFAULT_PLATFORM_SETTINGS');

    if (shouldBootstrap !== true) {
      return;
    }

    await this.platformSettingsService.upsertSetting({
      key: IdentityVerificationRoutingSettingKey,
      description:
        'Default identity verification routing policy seeded by controlled control-plane bootstrap',
      value: getDefaultIdentityVerificationRouting(),
    });

    await this.platformSettingsService.upsertSetting({
      key: VerificationBillingPolicySettingKey,
      description:
        'Default verification billing policy seeded by controlled control-plane bootstrap',
      value: getDefaultVerificationBillingPolicy(),
    });
  }
}

export { getDefaultIdentityVerificationRouting, getDefaultVerificationBillingPolicy };
