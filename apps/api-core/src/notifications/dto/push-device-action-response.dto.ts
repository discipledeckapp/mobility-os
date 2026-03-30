import { ApiProperty } from '@nestjs/swagger';

export class PushDeviceActionResponseDto {
  @ApiProperty()
  message!: string;
}
