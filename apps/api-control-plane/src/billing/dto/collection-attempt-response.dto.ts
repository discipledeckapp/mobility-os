import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CollectionAttemptResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  invoiceId!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty()
  kind!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  channel!: string;

  @ApiPropertyOptional()
  provider?: string | null;

  @ApiPropertyOptional()
  paymentReference?: string | null;

  @ApiPropertyOptional()
  metadata?: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  checkoutUrl?: string;

  @ApiPropertyOptional()
  accessCode?: string;
}
