import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LivenessReadinessResponseDto {
  @ApiProperty()
  countryCode!: string;

  @ApiProperty()
  ready!: boolean;

  @ApiProperty({
    enum: ['ready', 'misconfigured', 'temporarily_unavailable', 'unsupported_country'],
  })
  status!: 'ready' | 'misconfigured' | 'temporarily_unavailable' | 'unsupported_country';

  @ApiPropertyOptional()
  activeProvider?: string;

  @ApiProperty({ type: [String] })
  configuredProviders!: string[];

  @ApiProperty()
  checkedAt!: string;

  @ApiProperty()
  message!: string;
}
