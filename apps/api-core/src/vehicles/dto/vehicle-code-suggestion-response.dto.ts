import { ApiProperty } from '@nestjs/swagger';

export class VehicleCodeSuggestionResponseDto {
  @ApiProperty()
  suggestedTenantVehicleCode!: string;

  @ApiProperty()
  prefix!: string;
}
