import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RiskSignalResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty({ description: 'FraudSignalType from intelligence-domain' })
  type!: string;

  @ApiProperty({ description: 'low | medium | high | critical' })
  severity!: string;

  @ApiProperty({ description: 'system | tenant_report | external_feed' })
  source!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ description: 'Structured metadata — never contains cross-tenant PII' })
  metadata?: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: Date;
}
