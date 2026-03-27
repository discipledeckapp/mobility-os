import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { AddIdentifierDto } from './dto/add-identifier.dto';
import { IdentifierResponseDto } from './dto/identifier-response.dto';
import { IdentifiersService } from './identifiers.service';

@ApiTags('Identifiers (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/identifiers')
export class IdentifiersController {
  constructor(private readonly identifiersService: IdentifiersService) {}

  @Get('persons/:personId')
  @ApiOkResponse({ type: IdentifierResponseDto, isArray: true })
  listByPerson(@Param('personId') personId: string): Promise<IdentifierResponseDto[]> {
    return this.identifiersService.listByPerson(personId);
  }

  @Post()
  @ApiCreatedResponse({ type: IdentifierResponseDto })
  create(@Body() dto: AddIdentifierDto): Promise<IdentifierResponseDto> {
    return this.identifiersService.addIdentifier(dto);
  }

  @Patch(':id/verify')
  @ApiOkResponse({ type: IdentifierResponseDto })
  verify(@Param('id') id: string): Promise<IdentifierResponseDto> {
    return this.identifiersService.verifyIdentifier(id);
  }
}
