import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
import { AddIdentifierDto } from './dto/add-identifier.dto';
import { IdentifierResponseDto } from './dto/identifier-response.dto';
import { IdentifiersService } from './identifiers.service';

function maskIdentifierValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 4) {
    return '•'.repeat(trimmed.length);
  }
  return `${'•'.repeat(Math.max(trimmed.length - 4, 0))}${trimmed.slice(-4)}`;
}

@ApiTags('Identifiers (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/identifiers')
export class IdentifiersController {
  constructor(private readonly identifiersService: IdentifiersService) {}

  private toResponse(identifier: {
    id: string;
    personId: string;
    type: string;
    value: string;
    countryCode?: string | null;
    isVerified: boolean;
    createdAt: Date;
  }): IdentifierResponseDto {
    return {
      id: identifier.id,
      personId: identifier.personId,
      type: identifier.type,
      maskedValue: maskIdentifierValue(identifier.value),
      countryCode: identifier.countryCode ?? null,
      isVerified: identifier.isVerified,
      createdAt: identifier.createdAt,
    };
  }

  @Get('persons/:personId')
  @ApiOkResponse({ type: IdentifierResponseDto, isArray: true })
  async listByPerson(@Param('personId') personId: string): Promise<IdentifierResponseDto[]> {
    const identifiers = await this.identifiersService.listByPerson(personId);
    return identifiers.map((identifier) => this.toResponse(identifier));
  }

  @Post()
  @ApiCreatedResponse({ type: IdentifierResponseDto })
  async create(@Body() dto: AddIdentifierDto): Promise<IdentifierResponseDto> {
    const identifier = await this.identifiersService.addIdentifier(dto);
    return this.toResponse(identifier);
  }

  @Patch(':id/verify')
  @ApiOkResponse({ type: IdentifierResponseDto })
  async verify(@Param('id') id: string): Promise<IdentifierResponseDto> {
    const identifier = await this.identifiersService.verifyIdentifier(id);
    return this.toResponse(identifier);
  }
}
