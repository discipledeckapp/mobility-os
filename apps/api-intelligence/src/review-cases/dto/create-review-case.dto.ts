import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewCaseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiProperty({
    description: 'Composite confidence score that triggered manual review (0.0–1.0)',
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore!: number;

  @ApiProperty({
    description:
      'Structured evidence for the reviewer. Must never contain raw operational records from another tenant.',
  })
  @IsObject()
  evidence!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
