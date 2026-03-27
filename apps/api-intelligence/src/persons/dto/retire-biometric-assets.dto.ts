import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class RetireBiometricAssetsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}

export class RetireBiometricAssetsResponseDto {
  @ApiProperty()
  affectedPeople!: number;
}
