import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

const providerNames = [
  'amazon_rekognition',
  'youverify',
  'smile_identity',
  'internal_free_service',
] as const;

const billableStatuses = ['verified', 'no_match', 'provider_error'] as const;

export const VerificationBillingPolicySettingKey = 'verification_billing_policy' as const;

export const verificationBillingPolicySchema = z.object({
  countries: z.array(
    z.object({
      countryCode: z.string().min(2).max(2),
      enabled: z.boolean(),
      meterEventType: z.literal('identity_verification'),
      defaultFeeMinorUnits: z.number().int().min(0),
      billOnStatuses: z.array(z.enum(billableStatuses)).min(1),
      providers: z.array(
        z.object({
          name: z.enum(providerNames),
          enabled: z.boolean(),
          feeMinorUnits: z.number().int().min(0).optional(),
        }),
      ),
    }),
  ),
});

export type VerificationBillingPolicySetting = z.infer<typeof verificationBillingPolicySchema>;

class VerificationBillingProviderDto {
  @ApiProperty({ enum: providerNames })
  name!: (typeof providerNames)[number];

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ required: false })
  feeMinorUnits?: number;
}

class CountryVerificationBillingPolicyDto {
  @ApiProperty()
  countryCode!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ enum: ['identity_verification'] })
  meterEventType!: 'identity_verification';

  @ApiProperty()
  defaultFeeMinorUnits!: number;

  @ApiProperty({ enum: billableStatuses, isArray: true })
  billOnStatuses!: (typeof billableStatuses)[number][];

  @ApiProperty({ type: VerificationBillingProviderDto, isArray: true })
  providers!: VerificationBillingProviderDto[];
}

export class VerificationBillingPolicySettingDto {
  @ApiProperty({ type: CountryVerificationBillingPolicyDto, isArray: true })
  countries!: CountryVerificationBillingPolicyDto[];
}
