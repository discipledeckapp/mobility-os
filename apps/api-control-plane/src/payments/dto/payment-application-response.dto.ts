import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentApplicationResponseDto {
  @ApiProperty()
  provider!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty()
  purpose!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  invoiceId?: string;

  @ApiPropertyOptional()
  tenantId?: string;

  @ApiPropertyOptional()
  driverId?: string;

  @ApiPropertyOptional()
  paymentMethod?: {
    authorizationCode?: string | null;
    customerCode?: string | null;
    last4?: string | null;
    brand?: string | null;
  };
}
