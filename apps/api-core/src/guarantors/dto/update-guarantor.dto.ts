import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateGuarantorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fleetId?: string;

  @ApiPropertyOptional({ example: 'Chinwe Okafor' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 or country-local format when countryCode is provided',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'phone must contain only digits and may start with +',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'NG' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Sister' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  relationship?: string;
}
