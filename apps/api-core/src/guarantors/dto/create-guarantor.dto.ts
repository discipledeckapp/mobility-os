import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateGuarantorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fleetId!: string;

  @ApiProperty({ example: 'Chinwe Okafor' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiProperty({
    description: 'Phone number in E.164 or country-local format when countryCode is provided',
    example: '+2348012345678',
  })
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'phone must contain only digits and may start with +',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Email address — required to send a self-service verification link',
    example: 'chinwe.okafor@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
