import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RiskFactorResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  weight!: number;

  @ApiPropertyOptional()
  detail?: string;
}

export class PersonRiskSummaryResponseDto {
  @ApiProperty()
  personId!: string;

  @ApiProperty({ minimum: 0, maximum: 100 })
  score!: number;

  @ApiProperty()
  riskBand!: string;

  @ApiProperty({ type: RiskFactorResponseDto, isArray: true })
  contributingFactors!: RiskFactorResponseDto[];

  @ApiProperty()
  linkedOrganisationCount!: number;

  @ApiProperty()
  linkedRecordCount!: number;

  @ApiProperty()
  staleLinkedRecordCount!: number;

  @ApiProperty()
  activeReviewCaseCount!: number;

  @ApiProperty()
  activeWatchlistCount!: number;

  @ApiProperty()
  guarantorLinkedDriverCount!: number;

  @ApiProperty()
  guarantorExposureExceeded!: boolean;

  @ApiPropertyOptional()
  correctiveAction?: string;
}
