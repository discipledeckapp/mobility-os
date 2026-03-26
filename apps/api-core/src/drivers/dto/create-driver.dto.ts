import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fleetId!: string;

  /**
   * Email is required at admin-creation stage so a self-service onboarding
   * link can be sent to the driver immediately after creation.
   */
  @ApiProperty({ example: 'emeka@example.com' })
  @IsEmail()
  email!: string;

  /**
   * Name and phone are optional at creation — the driver completes them
   * during self-service onboarding.
   */
  @ApiPropertyOptional({ example: 'Emeka' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Okonkwo' })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number in local or international format',
    example: '08012345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'phone must contain only digits and may start with +',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date (YYYY-MM-DD)', example: '1990-06-15' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be YYYY-MM-DD' })
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2', example: 'NG' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  nationality?: string;
}
