import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';

export class UpdateTenantSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @ApiPropertyOptional({ enum: ['en', 'fr'] })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr'])
  defaultLanguage?: 'en' | 'fr';

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  guarantorMaxActiveDrivers?: number;
}
