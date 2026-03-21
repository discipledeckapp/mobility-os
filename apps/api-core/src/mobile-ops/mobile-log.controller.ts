import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthMessageResponseDto } from '../auth/dto/auth-message-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { MobileLogEntryDto } from './dto/mobile-log-entry.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { MobileLogService } from './mobile-log.service';

@ApiTags('MobileOps')
@Controller('mobile/log')
export class MobileLogController {
  constructor(private readonly mobileLogService: MobileLogService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: AuthMessageResponseDto })
  record(@Body() dto: MobileLogEntryDto): AuthMessageResponseDto {
    this.mobileLogService.record(dto);
    return { message: 'Mobile log captured.' };
  }
}
