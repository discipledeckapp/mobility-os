import {
  type IdentityVerificationProviderCapability,
  getCountryConfig,
} from '@mobility-os/domain-config';
import { Injectable, Logger } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { ControlPlaneBillingClient } from './control-plane-billing.client';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { ControlPlaneMeteringClient } from './control-plane-metering.client';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { ControlPlaneSettingsClient } from './control-plane-settings.client';
import type {
  IdentityProviderAdapter,
  IdentityVerificationResult,
  VerificationIdentifierInput,
} from './identity-providers';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { SmileIdentityProvider, YouVerifyProvider } from './identity-providers';
// biome-ignore lint/style/useImportType: NestJS DI requires runtime values for constructor metadata.
import { LivenessService } from './liveness.service';

export interface VerifyEnrollmentIdentityInput {
  tenantId: string;
  countryCode?: string;
  livenessPassed?: boolean;
  identifiers: VerificationIdentifierInput[];
  providerVerification?: {
    subjectConsent?: boolean;
    validationData?: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    };
    selfieImageBase64?: string;
    selfieImageUrl?: string;
    livenessCheck?: {
      provider?: string;
      sessionId?: string;
      passed?: boolean;
      confidenceScore?: number;
    };
  };
}

export interface VerifyEnrollmentIdentityOutput {
  attempted: boolean;
  verification?: IdentityVerificationResult;
  liveness?: {
    attempted: boolean;
    passed: boolean;
    fallbackChain: string[];
    providerName?: string;
    confidenceScore?: number;
    reason?: string;
  };
  fallbackChain: string[];
  reason?: string;
}

@Injectable()
export class IdentityVerificationService {
  private readonly logger = new Logger(IdentityVerificationService.name);
  private readonly providersByName: Record<string, IdentityProviderAdapter>;

  constructor(
    private readonly configService: ConfigService,
    private readonly controlPlaneBillingClient: ControlPlaneBillingClient,
    private readonly controlPlaneMeteringClient: ControlPlaneMeteringClient,
    private readonly controlPlaneSettingsClient: ControlPlaneSettingsClient,
    private readonly livenessService: LivenessService,
    youVerifyProvider: YouVerifyProvider,
    smileIdentityProvider: SmileIdentityProvider,
  ) {
    this.providersByName = {
      [youVerifyProvider.name]: youVerifyProvider,
      [smileIdentityProvider.name]: smileIdentityProvider,
    };
  }

  async verifyForEnrollment(
    input: VerifyEnrollmentIdentityInput,
  ): Promise<VerifyEnrollmentIdentityOutput> {
    let workingInput = input;

    this.logger.log(
      JSON.stringify({
        event: 'identity_verification_start',
        tenantId: input.tenantId,
        countryCode: input.countryCode ?? null,
        identifierCount: input.identifiers.length,
        identifierTypes: input.identifiers.map((i) => i.type),
        hasSelfie: Boolean(input.providerVerification?.selfieImageBase64),
        hasLivenessEvidence: Boolean(input.providerVerification?.livenessCheck?.sessionId),
        livenessProvider: input.providerVerification?.livenessCheck?.provider ?? null,
        livenessSessionId: input.providerVerification?.livenessCheck?.sessionId ?? null,
        subjectConsent: input.providerVerification?.subjectConsent ?? false,
      }),
    );

    if (!workingInput.countryCode) {
      return {
        attempted: false,
        fallbackChain: [],
        reason: 'country code not provided',
      };
    }

    const countryConfig = getCountryConfig(workingInput.countryCode);
    const routingOverride =
      await this.controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry(
        workingInput.countryCode,
      );
    const verificationConfig = countryConfig.identityVerification;
    if (!verificationConfig?.providerLookupEnabled) {
      return {
        attempted: false,
        fallbackChain: [],
        reason: 'provider lookup disabled for country',
      };
    }

    if (
      verificationConfig.livenessRequiredBeforeProviderLookup &&
      workingInput.livenessPassed !== true
    ) {
      const livenessResult = await this.livenessService.evaluate({
        countryCode: workingInput.countryCode,
        ...(workingInput.livenessPassed !== undefined
          ? { livenessPassed: workingInput.livenessPassed }
          : {}),
        ...(workingInput.providerVerification?.livenessCheck
          ? { evidence: workingInput.providerVerification.livenessCheck }
          : {}),
      });

      if (!livenessResult.passed) {
        return {
          attempted: false,
          liveness: livenessResult,
          fallbackChain: livenessResult.fallbackChain,
          reason: livenessResult.reason ?? 'liveness must pass before provider lookup',
        };
      }

      workingInput = {
        ...workingInput,
        livenessPassed: true,
        providerVerification: {
          ...workingInput.providerVerification,
          livenessCheck: {
            ...workingInput.providerVerification?.livenessCheck,
            ...(livenessResult.providerName ? { provider: livenessResult.providerName } : {}),
            ...(livenessResult.confidenceScore !== undefined
              ? { confidenceScore: livenessResult.confidenceScore }
              : {}),
            passed: true,
          },
        },
      };
    }

    const providerCapabilities = new Map<string, IdentityVerificationProviderCapability>(
      (verificationConfig.providerCapabilities ?? []).map((provider) => [provider.name, provider]),
    );

    const orderedProviders = (
      routingOverride ? routingOverride.lookupProviders : verificationConfig.providers
    )
      .filter((provider) => provider.enabled)
      .sort((left, right) => left.priority - right.priority);

    const fallbackChain: string[] = [];

    for (const providerConfig of orderedProviders) {
      const capability = providerCapabilities.get(providerConfig.name);
      if (!capability?.supportsLookup) {
        fallbackChain.push(`${providerConfig.name}:unsupported_lookup`);
        continue;
      }

      const provider = this.providersByName[providerConfig.name];
      if (!provider) {
        fallbackChain.push(`${providerConfig.name}:missing_adapter`);
        continue;
      }

      const scopedIdentifiers = workingInput.identifiers.filter(
        (identifier) =>
          ('allowedLookupIdentifierTypes' in providerConfig
            ? providerConfig.allowedLookupIdentifierTypes
            : providerConfig.allowedIdentifierTypes
          ).includes(identifier.type) &&
          capability.allowedLookupIdentifierTypes.includes(identifier.type),
      );
      if (scopedIdentifiers.length === 0 || !provider.canVerify(scopedIdentifiers)) {
        fallbackChain.push(`${provider.name}:skipped`);
        continue;
      }

      this.logger.log(
        JSON.stringify({
          event: 'identity_provider_request',
          tenantId: workingInput.tenantId,
          provider: provider.name,
          identifierTypes: scopedIdentifiers.map((i) => i.type),
          hasSelfie: Boolean(workingInput.providerVerification?.selfieImageBase64),
        }),
      );

      const result = await provider.verify(scopedIdentifiers, workingInput.providerVerification);

      this.logger.log(
        JSON.stringify({
          event: 'identity_provider_response',
          tenantId: workingInput.tenantId,
          provider: provider.name,
          status: result.status,
          verificationStatus: result.verificationStatus ?? null,
          matchedIdentifierType: result.matchedIdentifierType ?? null,
          portraitAvailable: result.documentMetadata?.portraitAvailable ?? false,
          hasEnrichment: Boolean(result.enrichment?.fullName),
        }),
      );

      fallbackChain.push(`${provider.name}:${result.status}`);
      await this.recordVerificationChargeIfBillable(workingInput, provider.name, result.status);

      if (result.status === 'verified' || result.status === 'no_match') {
        return {
          attempted: true,
          verification: result,
          ...(workingInput.providerVerification?.livenessCheck
            ? {
                liveness: {
                  attempted: true,
                  passed: workingInput.providerVerification.livenessCheck.passed ?? false,
                  fallbackChain: [],
                  ...(workingInput.providerVerification.livenessCheck.provider
                    ? { providerName: workingInput.providerVerification.livenessCheck.provider }
                    : {}),
                  ...(workingInput.providerVerification.livenessCheck.confidenceScore !== undefined
                    ? {
                        confidenceScore:
                          workingInput.providerVerification.livenessCheck.confidenceScore,
                      }
                    : {}),
                },
              }
            : {}),
          fallbackChain,
        };
      }

      if (result.status !== 'provider_unavailable' && result.status !== 'provider_error') {
        return {
          attempted: true,
          verification: result,
          ...(workingInput.providerVerification?.livenessCheck
            ? {
                liveness: {
                  attempted: true,
                  passed: workingInput.providerVerification.livenessCheck.passed ?? false,
                  fallbackChain: [],
                  ...(workingInput.providerVerification.livenessCheck.provider
                    ? { providerName: workingInput.providerVerification.livenessCheck.provider }
                    : {}),
                  ...(workingInput.providerVerification.livenessCheck.confidenceScore !== undefined
                    ? {
                        confidenceScore:
                          workingInput.providerVerification.livenessCheck.confidenceScore,
                      }
                    : {}),
                },
              }
            : {}),
          fallbackChain,
        };
      }

      const allowFallback =
        result.status === 'provider_error'
          ? (routingOverride?.fallbackOnProviderError ?? true)
          : (routingOverride?.fallbackOnProviderUnavailable ?? true);
      if (!allowFallback) {
        return {
          attempted: true,
          verification: result,
          fallbackChain,
        };
      }
    }

    return {
      attempted: fallbackChain.length > 0,
      ...(input.providerVerification?.livenessCheck
        ? {
            liveness: {
              attempted: true,
              passed: input.providerVerification.livenessCheck.passed ?? false,
              fallbackChain: [],
              ...(input.providerVerification.livenessCheck.provider
                ? { providerName: input.providerVerification.livenessCheck.provider }
                : {}),
              ...(input.providerVerification.livenessCheck.confidenceScore !== undefined
                ? {
                    confidenceScore: input.providerVerification.livenessCheck.confidenceScore,
                  }
                : {}),
            },
          }
        : {}),
      fallbackChain,
      reason: 'all configured providers were unavailable or errored',
    };
  }

  private async recordVerificationChargeIfBillable(
    input: VerifyEnrollmentIdentityInput,
    providerName: string,
    status: IdentityVerificationResult['status'],
  ): Promise<void> {
    if (!input.countryCode) {
      return;
    }

    if (status === 'provider_unavailable' || status === 'skipped') {
      return;
    }

    const policy = await this.controlPlaneSettingsClient.getVerificationBillingPolicyForCountry(
      input.countryCode,
    );
    if (!policy?.enabled) {
      return;
    }

    if (!policy.billOnStatuses.includes(status)) {
      return;
    }

    const providerPolicy = policy.providers.find((provider) => provider.name === providerName);
    if (providerPolicy && providerPolicy.enabled === false) {
      return;
    }

    const amountMinorUnits = providerPolicy?.feeMinorUnits ?? policy.defaultFeeMinorUnits;
    if (amountMinorUnits <= 0) {
      return;
    }

    const referenceId = `identity_verification:${providerName}:${Date.now()}`;
    await this.controlPlaneMeteringClient.recordUsageEvent({
      tenantId: input.tenantId,
      eventType: policy.meterEventType,
      quantity: 1,
      ...(input.countryCode ? { countryCode: input.countryCode } : {}),
      idempotencyKey: `${input.tenantId}:${referenceId}`,
      occurredAt: new Date().toISOString(),
    });

    await this.controlPlaneBillingClient.recordVerificationCharge({
      tenantId: input.tenantId,
      amountMinorUnits,
      referenceId,
      description: `Identity verification provider charge for ${providerName}`,
    });
  }
}
