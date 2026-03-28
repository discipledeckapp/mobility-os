import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LivenessReadinessDto {
  @ApiProperty({ description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  @IsNotEmpty()
  countryCode!: string;
}
