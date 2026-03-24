import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';
import { CreateWorkOrderDto } from './create-work-order.dto';

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @ApiPropertyOptional({ example: 'in_progress' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  status?: string;
}
