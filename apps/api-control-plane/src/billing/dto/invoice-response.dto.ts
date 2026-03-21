import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceLineItemResponseDto } from './invoice-line-item-response.dto';

export class InvoiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ description: 'References tenants.id in api-core (cross-schema)' })
  tenantId!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty({ description: 'InvoiceStatus: draft | open | paid | void | uncollectible' })
  status!: string;

  @ApiProperty({ description: 'Amount due in minor currency units' })
  amountDueMinorUnits!: number;

  @ApiProperty({ description: 'Amount paid in minor currency units' })
  amountPaidMinorUnits!: number;

  @ApiProperty({ description: 'ISO 4217 currency code' })
  currency!: string;

  @ApiProperty()
  periodStart!: Date;

  @ApiProperty()
  periodEnd!: Date;

  @ApiPropertyOptional()
  dueAt?: Date | null;

  @ApiPropertyOptional()
  paidAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: InvoiceLineItemResponseDto, isArray: true })
  lineItems?: InvoiceLineItemResponseDto[];
}
