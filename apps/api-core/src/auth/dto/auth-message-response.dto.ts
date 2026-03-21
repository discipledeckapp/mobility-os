import { ApiProperty } from '@nestjs/swagger';

export class AuthMessageResponseDto {
  @ApiProperty({
    example: 'If the account exists and is eligible, the requested auth message has been sent.',
  })
  message!: string;
}
