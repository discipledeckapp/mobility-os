import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrUpdateDriverGuarantorDto {
  @ApiProperty({ example: 'Chinwe Okafor' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name!: string;

  @ApiProperty({
    description: 'Phone number in local or international format',
    example: '08012345678',
  })
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'phone must contain only digits and may start with +',
  })
  phone!: string;

  @ApiPropertyOptional({
    description: 'Email address — required to send a guarantor self-service verification link',
    example: 'chinwe.okafor@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 phone country context', example: 'NG' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({ example: 'Sister' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  relationship?: string;

  @ApiPropertyOptional({ example: 'Guarantor asked to be removed' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  disconnectedReason?: string;
}
