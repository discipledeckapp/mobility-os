import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceLineItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  kind!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitAmountMinorUnits!: number;

  @ApiProperty()
  amountMinorUnits!: number;

  @ApiPropertyOptional()
  metadata?: unknown;

  @ApiProperty()
  createdAt!: Date;
}
