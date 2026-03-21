import { FraudSignalType } from '@mobility-os/intelligence-domain';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

const SIGNAL_TYPES = Object.values(FraudSignalType);
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const SOURCES = ['system', 'tenant_report', 'external_feed'] as const;

export class AddRiskSignalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty({ enum: SIGNAL_TYPES })
  @IsIn(SIGNAL_TYPES)
  type!: string;

  @ApiProperty({ enum: SEVERITIES })
  @IsIn(SEVERITIES)
  severity!: string;

  @ApiProperty({ enum: SOURCES })
  @IsIn(SOURCES)
  source!: string;

  @ApiPropertyOptional({
    description:
      'Structured metadata (e.g. conflicting person IDs, tenant ID for reports). ' +
      "Must never contain PII from another tenant's operational records.",
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
