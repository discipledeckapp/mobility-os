import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { RiskScore } from '@mobility-os/intelligence-domain';
import { IntelligenceApiKeyGuard } from '../auth/guards/intelligence-api-key.guard';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: NestJS @Body DTOs are referenced at runtime.
import { CreatePersonDto } from './dto/create-person.dto';
import {
  IdentityChangeEventResponseDto,
  IntelligenceQueryResultDto,
  LinkageEventResponseDto,
  PersonAssociationResponseDto,
  PersonResponseDto,
  RolePresenceDto,
  // biome-ignore lint/style/useImportType: NestJS @Body DTOs are referenced at runtime.
  UpdateWatchlistedDto,
} from './dto/person-response.dto';
import {
  RetireBiometricAssetsDto,
  RetireBiometricAssetsResponseDto,
} from './dto/retire-biometric-assets.dto';
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

  private toPersonResponse(person: {
    globalRiskScore: number;
  } & Omit<PersonResponseDto, 'riskBand'>): PersonResponseDto {
    return {
      ...person,
      riskBand: RiskScore.of(person.globalRiskScore).band,
    };
  }

  @Get()
  @ApiOkResponse({ type: PersonResponseDto, isArray: true })
  list(
    @Query('q') q?: string,
    @Query('riskBand') riskBand?: string,
    @Query('countryCode') countryCode?: string,
    @Query('watchlistStatus') watchlistStatus?: 'flagged' | 'clear',
    @Query('reviewState') reviewState?: 'open' | 'in_review' | 'resolved' | 'escalated',
    @Query('roleType') roleType?: 'driver' | 'guarantor' | 'owner' | 'admin',
    @Query('reverificationRequired') reverificationRequired?: string,
  ): Promise<PersonResponseDto[]> {
    return this.personsService
      .listForStaff({
        ...(q ? { q } : {}),
        ...(riskBand ? { riskBand } : {}),
        ...(countryCode ? { countryCode } : {}),
        ...(watchlistStatus ? { watchlistStatus } : {}),
        ...(reviewState ? { reviewState } : {}),
        ...(roleType ? { roleType } : {}),
        ...(reverificationRequired !== undefined
          ? { reverificationRequired: reverificationRequired === 'true' }
          : {}),
      })
      .then((people) => people.map((person) => this.toPersonResponse(person as never)));
  }

  @Post()
  @ApiCreatedResponse({ type: PersonResponseDto })
  create(@Body() dto: CreatePersonDto): Promise<PersonResponseDto> {
    return this.personsService.create(dto).then((person) => this.toPersonResponse(person as never));
  }

  @Get(':id')
  @ApiOkResponse({ type: PersonResponseDto })
  findById(@Param('id') id: string): Promise<PersonResponseDto> {
    return this.personsService.findById(id).then((person) => this.toPersonResponse(person as never));
  }

  @Get(':id/associations')
  @ApiOkResponse({ type: PersonAssociationResponseDto, isArray: true })
  listAssociations(@Param('id') id: string): Promise<PersonAssociationResponseDto[]> {
    return this.personsService.listAssociations(id).then((associations) =>
      associations.map((association) => ({
        ...association,
        staleFieldKeys:
          Array.isArray(association.staleFieldKeys) &&
          association.staleFieldKeys.every((value) => typeof value === 'string')
            ? (association.staleFieldKeys as string[])
            : null,
      })),
    );
  }

  @Get(':id/linkage-events')
  @ApiOkResponse({ type: LinkageEventResponseDto, isArray: true })
  listLinkageEvents(@Param('id') id: string): Promise<LinkageEventResponseDto[]> {
    return this.personsService.listLinkageEvents(id).then((events) =>
      events.map((event) => ({
        ...event,
        metadata:
          event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
            ? (event.metadata as Record<string, unknown>)
            : null,
      })),
    );
  }

  @Get(':id/identity-changes')
  @ApiOkResponse({ type: IdentityChangeEventResponseDto, isArray: true })
  listIdentityChanges(@Param('id') id: string): Promise<IdentityChangeEventResponseDto[]> {
    return this.personsService.listIdentityChanges(id).then((events) =>
      events.map((event) => ({
        ...event,
        changedFields: Array.isArray(event.changedFields)
          ? event.changedFields.filter((value: unknown): value is string => typeof value === 'string')
          : [],
        previousValues:
          event.previousValues &&
          typeof event.previousValues === 'object' &&
          !Array.isArray(event.previousValues)
            ? (event.previousValues as Record<string, unknown>)
            : null,
        newValues:
          event.newValues &&
          typeof event.newValues === 'object' &&
          !Array.isArray(event.newValues)
            ? (event.newValues as Record<string, unknown>)
            : null,
      })),
    );
  }

  @Patch(':id/risk-score')
  @ApiOkResponse({ type: PersonResponseDto })
  updateRiskScore(
    @Param('id') id: string,
    @Body('score') score: number,
  ): Promise<PersonResponseDto> {
    return this.personsService.updateRiskScore(id, score).then((person) => this.toPersonResponse(person as never));
  }

  @Patch(':id/watchlisted')
  @ApiOkResponse({ type: PersonResponseDto })
  setWatchlisted(
    @Param('id') id: string,
    @Body() dto: UpdateWatchlistedDto,
  ): Promise<PersonResponseDto> {
    return this.personsService
      .setWatchlisted(id, dto.isWatchlisted)
      .then((person) => this.toPersonResponse(person as never));
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

@ApiTags('Persons (Internal)')
@ApiSecurity('x-api-key')
@ApiHeader({ name: 'x-api-key', required: true })
@UseGuards(IntelligenceApiKeyGuard)
@Controller('internal/persons')
export class PersonsInternalController {
  constructor(private readonly personsService: PersonsService) {}

  @Post('retire-biometric-assets')
  @ApiCreatedResponse({ type: RetireBiometricAssetsResponseDto })
  retireBiometricAssets(
    @Body() dto: RetireBiometricAssetsDto,
  ): Promise<RetireBiometricAssetsResponseDto> {
    return this.personsService.retireBiometricAssets(dto.urls);
  }
}
