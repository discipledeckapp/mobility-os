import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class ReportAssignmentIncidentDto {
  @ApiProperty({ example: 'collision' })
  @IsString()
  @Length(1, 40)
  category!: string;

  @ApiProperty({ example: 'minor' })
  @IsString()
  @Length(1, 40)
  severity!: string;

  @ApiProperty({ example: 'Side mirror damaged in traffic' })
  @IsString()
  @Length(1, 120)
  title!: string;

  @ApiPropertyOptional({ example: 'Another vehicle clipped the left mirror in traffic.' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiProperty({ example: '2026-03-24T08:30:00.000Z' })
  @IsDateString()
  occurredAt!: string;

  @ApiPropertyOptional({ example: 90000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedCostMinorUnits?: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
