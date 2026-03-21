import { ApiProperty } from '@nestjs/swagger';

export class PlatformLoginResponseDto {
  @ApiProperty()
  accessToken!: string;
}
