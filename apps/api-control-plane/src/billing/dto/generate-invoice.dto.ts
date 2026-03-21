import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GenerateInvoiceDto {
  @ApiPropertyOptional({ description: 'Override billing period start (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Override billing period end (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @ApiPropertyOptional({ description: 'Invoice due date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiPropertyOptional({ description: 'Open invoice immediately instead of draft' })
  @IsOptional()
  @IsString()
  status?: string;
}
