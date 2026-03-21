import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentCheckoutResponseDto {
  @ApiProperty()
  provider!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  checkoutUrl!: string;

  @ApiPropertyOptional()
  accessCode?: string;

  @ApiProperty()
  purpose!: string;
}
