import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ReviewInspectionDto {
  @ApiProperty({ example: 'approve' })
  @IsString()
  @Length(1, 20)
  decision!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  comments?: string;
}
