import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PrismaService } from '../database/prisma.service';
import type { IntelWatchlistEntry } from '../generated/prisma';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { PersonsService } from '../persons/persons.service';
import type { CreateWatchlistEntryDto } from './dto/create-watchlist-entry.dto';

@Injectable()
export class WatchlistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
  ) {}

  async create(dto: CreateWatchlistEntryDto, actorId: string): Promise<IntelWatchlistEntry> {
    await this.personsService.findById(dto.personId);

    const entry = await this.prisma.intelWatchlistEntry.create({
      data: {
        personId: dto.personId,
        type: dto.type,
        reason: dto.reason,
        addedBy: actorId,
        ...(dto.expiresAt ? { expiresAt: new Date(dto.expiresAt) } : {}),
        isActive: true,
      },
    });

    await this.personsService.setWatchlisted(dto.personId, true);
    return entry;
  }

  async listByPerson(personId: string): Promise<IntelWatchlistEntry[]> {
    await this.personsService.findById(personId);

    return this.prisma.intelWatchlistEntry.findMany({
      where: { personId },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string): Promise<IntelWatchlistEntry> {
    const entry = await this.prisma.intelWatchlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`WatchlistEntry '${id}' not found`);
    }

    return entry;
  }

  async deactivate(id: string): Promise<IntelWatchlistEntry> {
    const entry = await this.prisma.intelWatchlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`WatchlistEntry '${id}' not found`);
    }

    if (!entry.isActive) {
      throw new BadRequestException(`WatchlistEntry '${id}' is already inactive`);
    }

    const updated = await this.prisma.intelWatchlistEntry.update({
      where: { id },
      data: { isActive: false },
    });

    const remainingActiveEntries = await this.prisma.intelWatchlistEntry.count({
      where: {
        personId: entry.personId,
        isActive: true,
      },
    });

    if (remainingActiveEntries === 0) {
      await this.personsService.setWatchlisted(entry.personId, false);
    }

    return updated;
  }
}
