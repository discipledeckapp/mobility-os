import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  issueDescription!: string;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  status!: string;

  @ApiPropertyOptional()
  vendorId?: string | null;

  @ApiPropertyOptional()
  totalCostMinorUnits?: number | null;

  @ApiPropertyOptional()
  currency?: string | null;

  @ApiProperty()
  createdAt!: string;
}
