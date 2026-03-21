import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const identifierTypes = [
  'NATIONAL_ID',
  'BANK_ID',
  'PASSPORT',
  'DRIVERS_LICENSE',
  'PHONE',
  'EMAIL',
  'TAX_ID',
] as const;

const providerNames = [
  'amazon_rekognition',
  'youverify',
  'smile_identity',
  'internal_free_service',
] as const;

export const IdentityVerificationRoutingSettingKey = 'identity_verification_routing' as const;

export const identityVerificationRoutingSchema = z.object({
  countries: z.array(
    z.object({
      countryCode: z.string().min(2).max(2),
      livenessProviders: z
        .array(
          z.object({
            name: z.enum(providerNames),
            enabled: z.boolean(),
            priority: z.number().int().positive(),
          }),
        )
        .min(1),
      lookupProviders: z
        .array(
          z.object({
            name: z.enum(providerNames),
            enabled: z.boolean(),
            priority: z.number().int().positive(),
            allowedIdentifierTypes: z.array(z.enum(identifierTypes)).min(1),
          }),
        )
        .min(1),
      fallbackOnProviderError: z.boolean(),
      fallbackOnProviderUnavailable: z.boolean(),
      fallbackOnNoMatch: z.boolean(),
    }),
  ),
});

export type IdentityVerificationRoutingSetting = z.infer<typeof identityVerificationRoutingSchema>;

class LookupProviderOptionDto {
  @ApiProperty({ enum: providerNames })
  name!: (typeof providerNames)[number];

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  priority!: number;

  @ApiProperty({ enum: identifierTypes, isArray: true })
  allowedIdentifierTypes!: (typeof identifierTypes)[number][];
}

class LivenessProviderOptionDto {
  @ApiProperty({ enum: providerNames })
  name!: (typeof providerNames)[number];

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  priority!: number;
}

class CountryIdentityVerificationRoutingDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code' })
  countryCode!: string;

  @ApiProperty({ type: LivenessProviderOptionDto, isArray: true })
  livenessProviders!: LivenessProviderOptionDto[];

  @ApiProperty({ type: LookupProviderOptionDto, isArray: true })
  lookupProviders!: LookupProviderOptionDto[];

  @ApiProperty()
  fallbackOnProviderError!: boolean;

  @ApiProperty()
  fallbackOnProviderUnavailable!: boolean;

  @ApiProperty()
  fallbackOnNoMatch!: boolean;
}

export class IdentityVerificationRoutingSettingDto {
  @ApiProperty({ type: CountryIdentityVerificationRoutingDto, isArray: true })
  countries!: CountryIdentityVerificationRoutingDto[];
}
