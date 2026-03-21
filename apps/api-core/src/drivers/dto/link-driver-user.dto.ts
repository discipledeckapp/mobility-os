import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkDriverUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
