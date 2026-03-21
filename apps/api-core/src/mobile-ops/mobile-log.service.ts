import { Injectable, Logger } from '@nestjs/common';
import type { MobileLogEntryDto } from './dto/mobile-log-entry.dto';

@Injectable()
export class MobileLogService {
  private readonly logger = new Logger('MobileOpsLog');

  record(dto: MobileLogEntryDto) {
    const prefix = `[${dto.level.toUpperCase()}]${dto.category ? ` [${dto.category}]` : ''}`;
    const route = dto.route ? ` route=${dto.route}` : '';
    const user = dto.userId ? ` user=${dto.userId}` : '';
    const tenant = dto.tenantId ? ` tenant=${dto.tenantId}` : '';
    const metadata = dto.metadata ? ` metadata=${JSON.stringify(dto.metadata)}` : '';
    const stack = dto.stack ? ` stack=${dto.stack}` : '';
    const line = `${prefix}${route}${user}${tenant} ${dto.message}${metadata}${stack}`;

    if (dto.level === 'error') {
      this.logger.error(line);
      return;
    }

    if (dto.level === 'warning') {
      this.logger.warn(line);
      return;
    }

    this.logger.log(line);
  }
}
