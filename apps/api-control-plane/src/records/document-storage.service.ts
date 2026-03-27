import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ControlPlaneDocumentStorageService {
  private readonly storageRoot = join(process.cwd(), '.runtime', 'control-plane-documents');

  async uploadFile(buffer: Buffer, fileName: string) {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
    const absolutePath = join(this.storageRoot, storageKey);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);
    return {
      storageKey,
      storageUrl: `file://${absolutePath}`,
      fileHash: createHash('sha256').update(buffer).digest('hex'),
    };
  }

  async readFile(storageKey: string) {
    try {
      return await readFile(join(this.storageRoot, storageKey));
    } catch {
      throw new NotFoundException('Document content is no longer available.');
    }
  }
}
