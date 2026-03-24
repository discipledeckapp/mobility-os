import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitInspectionMediaDto {
  @ApiProperty({ example: 'image' })
  @IsString()
  @Length(1, 30)
  mediaType!: string;

  @ApiPropertyOptional({ example: 'front' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  viewpoint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storageKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  storageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  capturedAt?: string;
}

export class SubmitInspectionResultDto {
  @ApiProperty()
  @IsString()
  checklistItemId!: string;

  @ApiProperty({ example: 'PASS' })
  @IsString()
  @Length(1, 20)
  result!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;

  @ApiPropertyOptional({ type: [SubmitInspectionMediaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitInspectionMediaDto)
  media?: SubmitInspectionMediaDto[];
}

export class SubmitInspectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  odometerKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLatitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  gpsLongitude?: number;

  @ApiProperty({ type: [SubmitInspectionResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitInspectionResultDto)
  results!: SubmitInspectionResultDto[];
}
