import { ApiProperty } from '@nestjs/swagger';

export class VehicleRiskResponseDto {
  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  riskLevel!: string;

  @ApiProperty({ type: [String] })
  reasons!: string[];

  @ApiProperty()
  isAssignmentLocked!: boolean;

  @ApiProperty()
  evaluatedAt!: string;
}
