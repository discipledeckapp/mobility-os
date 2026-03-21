import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface StoredDocumentFile {
  storageKey: string;
  absolutePath: string;
}

@Injectable()
export class DocumentStorageService {
  private readonly storageRoot = join(process.cwd(), '.runtime', 'driver-documents');

  async uploadFile(buffer: Buffer, fileName: string): Promise<StoredDocumentFile> {
    await mkdir(this.storageRoot, { recursive: true });
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${randomUUID()}-${safeName}`;
    const absolutePath = join(this.storageRoot, storageKey);
    await writeFile(absolutePath, buffer);
    return { storageKey, absolutePath };
  }

  async readFile(storageKey: string): Promise<Buffer> {
    try {
      return await readFile(join(this.storageRoot, storageKey));
    } catch {
      throw new NotFoundException('Document content is no longer available.');
    }
  }

  async deleteFile(storageKey?: string | null): Promise<void> {
    if (!storageKey) return;
    try {
      await unlink(join(this.storageRoot, storageKey));
    } catch {
      // Best-effort cleanup only.
    }
  }
}
