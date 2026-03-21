import {
  type IdentityVerificationProviderCapability,
  getCountryConfig,
  isCountrySupported,
} from '@mobility-os/domain-config';
import { Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import type { CpPlatformSetting, Prisma } from '../generated/prisma';
import {
  IdentityVerificationRoutingSettingKey,
  identityVerificationRoutingSchema,
} from './dto/identity-verification-routing.dto';
import type { UpsertPlatformSettingDto } from './dto/upsert-platform-setting.dto';
import {
  VerificationBillingPolicySettingKey,
  verificationBillingPolicySchema,
} from './dto/verification-billing-policy.dto';

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSettings(): Promise<CpPlatformSetting[]> {
    return this.prisma.cpPlatformSetting.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async getSetting(key: string): Promise<CpPlatformSetting> {
    const setting = await this.prisma.cpPlatformSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Platform setting '${key}' not found`);
    }

    return setting;
  }

  async upsertSetting(dto: UpsertPlatformSettingDto): Promise<CpPlatformSetting> {
    const validatedValue = this.validateSettingValue(dto.key, dto.value);

    return this.prisma.cpPlatformSetting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        description: dto.description ?? null,
        value: validatedValue,
      },
      update: {
        description: dto.description ?? null,
        value: validatedValue,
      },
    });
  }

  private validateSettingValue(key: string, value: Record<string, unknown>): Prisma.InputJsonValue {
    if (key === IdentityVerificationRoutingSettingKey) {
      const parsed = identityVerificationRoutingSchema.parse(value);
      this.validateIdentityVerificationRouting(parsed);
      return parsed as Prisma.InputJsonValue;
    }

    if (key === VerificationBillingPolicySettingKey) {
      const parsed = verificationBillingPolicySchema.parse(value);
      this.validateVerificationBillingPolicy(parsed);
      return parsed as Prisma.InputJsonValue;
    }

    return value as Prisma.InputJsonValue;
  }

  private validateIdentityVerificationRouting(
    value: ReturnType<typeof identityVerificationRoutingSchema.parse>,
  ): void {
    for (const country of value.countries) {
      const countryCode = country.countryCode.toUpperCase();
      if (!isCountrySupported(countryCode)) {
        throw new Error(
          `Country '${countryCode}' is not supported for identity verification routing`,
        );
      }

      const identityConfig = getCountryConfig(countryCode).identityVerification;
      const providerCapabilities = identityConfig?.providerCapabilities ?? [];
      const capabilitiesByName = new Map<string, IdentityVerificationProviderCapability>(
        providerCapabilities.map((provider) => [provider.name, provider]),
      );

      for (const provider of country.livenessProviders) {
        const capability = capabilitiesByName.get(provider.name);
        if (!capability?.supportsLiveness) {
          throw new Error(
            `Provider '${provider.name}' does not support liveness for country '${countryCode}'`,
          );
        }
      }

      for (const provider of country.lookupProviders) {
        const capability = capabilitiesByName.get(provider.name);
        if (!capability?.supportsLookup) {
          throw new Error(
            `Provider '${provider.name}' does not support lookup for country '${countryCode}'`,
          );
        }

        for (const identifierType of provider.allowedIdentifierTypes) {
          if (!capability.allowedLookupIdentifierTypes.includes(identifierType)) {
            throw new Error(
              `Provider '${provider.name}' does not support identifier type '${identifierType}' for country '${countryCode}'`,
            );
          }
        }
      }
    }
  }

  private validateVerificationBillingPolicy(
    value: ReturnType<typeof verificationBillingPolicySchema.parse>,
  ): void {
    for (const country of value.countries) {
      const countryCode = country.countryCode.toUpperCase();
      if (!isCountrySupported(countryCode)) {
        throw new Error(
          `Country '${countryCode}' is not supported for verification billing policy`,
        );
      }

      const identityConfig = getCountryConfig(countryCode).identityVerification;
      const providerCapabilities = identityConfig?.providerCapabilities ?? [];
      const capabilitiesByName = new Map<string, IdentityVerificationProviderCapability>(
        providerCapabilities.map((provider) => [provider.name, provider]),
      );

      for (const provider of country.providers) {
        if (!capabilitiesByName.has(provider.name)) {
          throw new Error(
            `Provider '${provider.name}' is not supported for country '${countryCode}'`,
          );
        }
      }
    }
  }
}
