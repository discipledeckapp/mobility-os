import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverIdentitySummaryDto {
  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  identityStatus!: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  globalRiskScore?: number | null;

  @ApiPropertyOptional()
  riskBand?: string | null;

  @ApiPropertyOptional()
  isWatchlisted?: boolean | null;

  @ApiPropertyOptional()
  duplicateIdentityFlag?: boolean | null;

  @ApiPropertyOptional()
  verificationProvider?: string | null;

  @ApiPropertyOptional()
  verificationStatus?: string | null;

  @ApiPropertyOptional()
  verificationCountryCode?: string | null;

  @ApiPropertyOptional()
  verificationConfidence?: number | null;

  @ApiProperty()
  verifiedIdentityExists!: boolean;

  @ApiProperty()
  summary!: string;
}
