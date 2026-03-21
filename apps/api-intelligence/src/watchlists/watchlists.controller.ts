import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { PlatformAuthGuard, type PlatformPrincipal } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: NestJS @Body DTOs are referenced at runtime.
import { CreateWatchlistEntryDto } from './dto/create-watchlist-entry.dto';
import { WatchlistEntryResponseDto } from './dto/watchlist-entry-response.dto';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { WatchlistsService } from './watchlists.service';

@ApiTags('Watchlists (Staff)')
@ApiBearerAuth('platform-staff')
@UseGuards(PlatformAuthGuard)
@Controller('staff/watchlists')
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Get('persons/:personId')
  @ApiOkResponse({ type: WatchlistEntryResponseDto, isArray: true })
  listByPerson(@Param('personId') personId: string): Promise<WatchlistEntryResponseDto[]> {
    return this.watchlistsService.listByPerson(personId);
  }

  @Get(':id')
  @ApiOkResponse({ type: WatchlistEntryResponseDto })
  findById(@Param('id') id: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.findById(id);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ type: WatchlistEntryResponseDto })
  deactivate(@Param('id') id: string): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.deactivate(id);
  }

  @Post()
  @ApiCreatedResponse({ type: WatchlistEntryResponseDto })
  create(
    @Body() dto: CreateWatchlistEntryDto,
    @Req() request: FastifyRequest & { platformPrincipal: PlatformPrincipal },
  ): Promise<WatchlistEntryResponseDto> {
    return this.watchlistsService.create(dto, request.platformPrincipal.userId);
  }
}
