import { ResolutionDecision } from '@mobility-os/intelligence-domain';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatchingResultDto {
  @ApiProperty({ enum: Object.values(ResolutionDecision) })
  decision!: string;

  @ApiPropertyOptional()
  personId?: string;

  @ApiPropertyOptional()
  reviewCaseId?: string;

  @ApiPropertyOptional()
  providerLookupStatus?: string;

  @ApiPropertyOptional()
  providerVerificationStatus?: string;

  @ApiPropertyOptional()
  providerName?: string;

  @ApiPropertyOptional()
  matchedIdentifierType?: string;

  @ApiPropertyOptional()
  isVerifiedMatch?: boolean;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: false,
  })
  verifiedProfile?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
  };

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  globalRiskScore?: number;

  @ApiPropertyOptional({ description: 'low | medium | high | critical' })
  riskBand?: string;

  @ApiPropertyOptional()
  isWatchlisted?: boolean;

  @ApiPropertyOptional()
  hasDuplicateIdentityFlag?: boolean;

  @ApiPropertyOptional()
  fraudIndicatorCount?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  verificationConfidence?: number;

  @ApiPropertyOptional()
  livenessPassed?: boolean;

  @ApiPropertyOptional()
  livenessProviderName?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  livenessConfidenceScore?: number;

  @ApiPropertyOptional()
  livenessReason?: string;

  @ApiPropertyOptional({
    description:
      'True when the enrolled subject was already present at this tenant in the ' +
      'opposite operational role (e.g. the guarantor is also a registered driver, ' +
      'or the driver is also a guarantor for another driver). A cross_role_presence ' +
      'risk signal has been emitted automatically.',
  })
  crossRoleConflict?: boolean;
}
