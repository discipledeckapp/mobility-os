import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewCaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  personId!: string;

  @ApiProperty({ description: 'open | in_review | resolved | escalated' })
  status!: string;

  @ApiPropertyOptional({
    description: 'merge | separate | fraud_confirmed | dismissed',
  })
  resolution!: string | null;

  @ApiProperty({ minimum: 0, maximum: 1 })
  confidenceScore!: number;

  @ApiProperty()
  evidence!: Record<string, unknown>;

  @ApiPropertyOptional()
  reviewedBy!: string | null;

  @ApiPropertyOptional()
  reviewedAt!: Date | null;

  @ApiPropertyOptional()
  notes!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
