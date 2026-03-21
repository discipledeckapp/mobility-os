import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { IntelligenceApiKeyGuard } from '../auth/guards/intelligence-api-key.guard';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: NestJS @Body DTOs are referenced at runtime.
import { CreatePersonDto } from './dto/create-person.dto';
import {
  IntelligenceQueryResultDto,
  PersonResponseDto,
  RolePresenceDto,
  // biome-ignore lint/style/useImportType: NestJS @Body DTOs are referenced at runtime.
  UpdateWatchlistedDto,
} from './dto/person-response.dto';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PersonsService } from './persons.service';

// Two controller classes sharing the same service — one per access model:
//
//  PersonsStaffController  — platform staff only (Bearer JWT, full person record)
//  PersonsQueryController  — tenant callers (API key, derived signals only)
//
// Separating them makes it impossible to accidentally put a tenant-facing
// endpoint in the staff controller (or vice-versa) without noticing.

@ApiTags('Persons (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/persons')
export class PersonsStaffController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiCreatedResponse({ type: PersonResponseDto })
  create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    return this.personsService.create(dto);
  }

  @Get(':id')
  @ApiOkResponse({ type: PersonResponseDto })
  findById(@Param('id') id: string): Promise<PersonResponseDto> {
    return this.personsService.findById(id);
  }

  @Patch(':id/risk-score')
  @ApiOkResponse({ type: PersonResponseDto })
  updateRiskScore(
    @Param('id') id: string,
    @Body('score') score: number,
  ): Promise<PersonResponseDto> {
    return this.personsService.updateRiskScore(id, score);
  }

  @Patch(':id/watchlisted')
  @ApiOkResponse({ type: PersonResponseDto })
  setWatchlisted(
    @Param('id') id: string,
    @Body() dto: UpdateWatchlistedDto,
  ): Promise<PersonResponseDto> {
    return this.personsService.setWatchlisted(id, dto.isWatchlisted);
  }
}

@ApiTags('Persons (Tenant Query)')
@ApiSecurity('x-api-key')
@ApiHeader({ name: 'x-api-key', required: true })
@UseGuards(IntelligenceApiKeyGuard)
@Controller('query/persons')
export class PersonsQueryController {
  constructor(private readonly personsService: PersonsService) {}

  /**
   * Returns derived intelligence signals for a person.
   * Tenant callers (api-core) call this after enrollment to get the risk profile.
   * Raw cross-tenant records are NEVER returned from this endpoint.
   */
  @Get(':personId')
  @ApiOkResponse({ type: IntelligenceQueryResultDto })
  query(@Param('personId') personId: string): Promise<IntelligenceQueryResultDto> {
    return this.personsService.queryForTenant(personId);
  }

  /**
   * Returns role presence signals for a person.
   * Tells the caller whether this person is known as a driver, guarantor, or both
   * across the platform — without revealing which tenants they appeared at.
   *
   * Use this to detect cross-role conflicts before or after enrollment.
   */
  @Get(':personId/role-presence')
  @ApiOkResponse({ type: RolePresenceDto })
  queryRolePresence(@Param('personId') personId: string): Promise<RolePresenceDto> {
    return this.personsService.queryRolePresence(personId);
  }
}
