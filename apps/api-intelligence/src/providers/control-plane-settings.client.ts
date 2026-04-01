import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';
import { signInternalServiceJwt } from '../auth/internal-service-jwt';

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
 * YouVerify is the only permitted liveness provider — no camera-capture fallbacks.
 * If YouVerify is not configured the session init will fail rather than silently
 * degrade to an internal assertion.
 */
export const DEFAULT_LIVENESS_ROUTING: IdentityVerificationRoutingCountrySetting = {
  countryCode: '*',
  livenessProviders: [{ name: 'youverify', enabled: true, priority: 1 }],
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
  fallbackOnProviderError: false,
  fallbackOnProviderUnavailable: false,
  fallbackOnNoMatch: false,
};

@Injectable()
export class ControlPlaneSettingsClient {
  constructor(private readonly configService: ConfigService) {}

  async getIdentityVerificationRoutingForCountry(
    countryCode: string,
  ): Promise<IdentityVerificationRoutingCountrySetting | null> {
    const baseUrl = this.configService.get<string>('CONTROL_PLANE_BASE_URL');
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      return null;
    }

    try {
      const bearerToken = await signInternalServiceJwt({
        secret: internalServiceJwtSecret,
        callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-intelligence'),
        audience: 'api-control-plane',
        expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
      });
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/platform-settings/identity-verification-routing`,
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
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
    const internalServiceJwtSecret = this.configService.get<string>('INTERNAL_SERVICE_JWT_SECRET');

    if (!baseUrl || !internalServiceJwtSecret) {
      return null;
    }

    try {
      const bearerToken = await signInternalServiceJwt({
        secret: internalServiceJwtSecret,
        callerId: this.configService.get<string>('INTERNAL_SERVICE_CALLER_ID', 'api-intelligence'),
        audience: 'api-control-plane',
        expiresIn: this.configService.get<string>('INTERNAL_SERVICE_JWT_EXPIRES_IN', '2m'),
      });
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/api/internal/platform-settings/verification-billing-policy`,
        {
          headers: {
            authorization: `Bearer ${bearerToken}`,
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
