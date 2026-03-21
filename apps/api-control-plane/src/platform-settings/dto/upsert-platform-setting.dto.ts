import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpsertPlatformSettingDto {
  @ApiProperty({
    description: "Stable structured settings key, for example 'identity_verification_routing'",
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Structured settings payload governed by platform-admin workflows',
    type: Object,
    additionalProperties: true,
    oneOf: [{ $ref: '#/components/schemas/IdentityVerificationRoutingSettingDto' }],
  })
  @IsObject()
  value!: Record<string, unknown>;
}
