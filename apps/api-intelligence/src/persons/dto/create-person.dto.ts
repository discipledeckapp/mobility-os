import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// A canonical person record is created by the identity resolution engine —
// not by direct API call in the normal flow. This DTO exists for platform-staff
// tooling (manual merges, test data, support workflows).

export class CreatePersonDto {
  @ApiPropertyOptional({
    description: 'Initial global risk score 0–100. Defaults to 0.',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  globalRiskScore?: number;
}
