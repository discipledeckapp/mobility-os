import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const REQUEST_TYPES = ['access', 'correction', 'deletion', 'restriction'] as const;

export class CreateDataSubjectRequestDto {
  @ApiProperty({ enum: REQUEST_TYPES })
  @IsIn(REQUEST_TYPES)
  requestType!: (typeof REQUEST_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}
