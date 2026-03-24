import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ada Obi' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiPropertyOptional({ enum: ['en', 'fr'] })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr'])
  preferredLanguage?: 'en' | 'fr';
}
