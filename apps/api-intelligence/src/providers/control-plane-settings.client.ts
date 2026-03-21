import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';

export type LivenessProviderName =
  | 'azure_face'
  | 'amazon_rekognition'
  | 'youverify'
  | 'smile_identity'
  | 'internal_free_service';

export interface IdentityVerificationRoutingCountrySetting {
  countryCode: string;
  livenessProviders: Array<{
    name: LivenessProviderName;
    enabled: boolean;
    priority: number;
  }>;
  lookupProviders: Array<{
    name: LivenessProviderName;
    enabled: boolean;
    priority: number;
    allowedIdentifierTypes: string[];
  }>;
  fallbackOnProviderError: boolean;
  fallbackOnProviderUnavailable: boolean;
  fallbackOnNoMatch: boolean;
}

interface IdentityVerificationRoutingResponse {
  countries: IdentityVerificationRoutingCountrySetting[];
}

export interface VerificationBillingPolicyCountrySetting {
  countryCode: string;
  enabled: boolean;
  meterEventType: 'identity_verification';
  defaultFeeMinorUnits: number;
  billOnStatuses: Array<'verified' | 'no_match' | 'provider_error'>;
  providers: Array<{
    name: 'amazon_rekognition' | 'youverify' | 'smile_identity' | 'internal_free_service';
    enabled: boolean;
    feeMinorUnits?: number;
  }>;
}

interface VerificationBillingPolicyResponse {
  countries: VerificationBillingPolicyCountrySetting[];
}

/**
 * Default routing used when control plane is unreachable (e.g. local dev).
 * azure_face is first; internal_free_service is the final fallback.
 */
export const DEFAULT_LIVENESS_ROUTING: IdentityVerificationRoutingCountrySetting = {
  countryCode: '*',
  livenessProviders: [
    { name: 'azure_face', enabled: true, priority: 1 },
    { name: 'amazon_rekognition', enabled: true, priority: 2 },
    { name: 'youverify', enabled: true, priority: 3 },
    { name: 'smile_identity', enabled: true, priority: 4 },
    { name: 'internal_free_service', enabled: true, priority: 5 },
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
};

@Injectable()
export class ControlPlaneSettingsClient {
  constructor(private readonly configService: ConfigService) {}

  async getIdentityVerificationRoutingForCountry(
    countryCode: string,
  ): Promise<IdentityVerificationRoutingCountrySetting | null> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_BASE_URL');
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/platform-settings/identity-verification-routing`,
        {
          headers: {
            'x-internal-service-token': internalToken,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as IdentityVerificationRoutingResponse;
      return (
        payload.countries.find(
          (country) => country.countryCode.toUpperCase() === countryCode.toUpperCase(),
        ) ?? null
      );
    } catch {
      return null;
    }
  }

  async getVerificationBillingPolicyForCountry(
    countryCode: string,
  ): Promise<VerificationBillingPolicyCountrySetting | null> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_BASE_URL');
    const internalToken = this.configService.get<string>('INTERNAL_SERVICE_TOKEN');

    if (!baseUrl || !internalToken) {
      return null;
    }

    try {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/platform-settings/verification-billing-policy`,
        {
          headers: {
            'x-internal-service-token': internalToken,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as VerificationBillingPolicyResponse;
      return (
        payload.countries.find(
          (country) => country.countryCode.toUpperCase() === countryCode.toUpperCase(),
        ) ?? null
      );
    } catch {
      return null;
    }
  }
}
