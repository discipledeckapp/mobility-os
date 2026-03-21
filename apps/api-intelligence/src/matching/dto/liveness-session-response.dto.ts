import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LivenessSessionResponseDto {
  @ApiProperty()
  providerName!: string;

  @ApiProperty()
  sessionId!: string;

  @ApiPropertyOptional()
  expiresAt?: string;

  @ApiPropertyOptional({
    description:
      'Provider-issued client auth token. For azure_face this is the authToken passed to the Azure Vision Face SDK on the client.',
  })
  clientAuthToken?: string;

  @ApiProperty({ type: [String] })
  fallbackChain!: string[];
}
