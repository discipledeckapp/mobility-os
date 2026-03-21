import { ApiProperty } from '@nestjs/swagger';

export class AccountVerificationResponseDto {
  @ApiProperty({ example: true })
  verified!: boolean;
}
