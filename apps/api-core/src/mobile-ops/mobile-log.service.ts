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
    const metadata = dto.metadata ? ` metadata=${this.redact(String(JSON.stringify(dto.metadata)))}` : '';
    const stack = dto.stack ? ` stack=${this.redact(dto.stack)}` : '';
    const line = `${prefix}${route}${user}${tenant} ${this.redact(dto.message)}${metadata}${stack}`;

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

  private redact(value: string): string {
    return value
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
      .replace(/\b(?:\+?\d[\d\s-]{7,}\d)\b/g, '[redacted-phone]')
      .replace(/\b\d{10,16}\b/g, '[redacted-number]')
      .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted-token]');
  }
}
