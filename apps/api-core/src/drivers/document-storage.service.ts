import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ApiCoreEnv } from '../config/env.config';

export interface StoredDocumentFile {
  storageKey: string;
  storageUrl: string;
}

@Injectable()
export class DocumentStorageService {
  private readonly provider: ApiCoreEnv['DOCUMENT_STORAGE_PROVIDER'];
  private readonly storageRoot: string;
  private readonly s3Bucket?: string;
  private readonly s3Endpoint?: string;
  private readonly s3PublicBaseUrl?: string;
  private readonly s3ForcePathStyle: boolean;
  private readonly s3Client?: S3Client;

  constructor(private readonly configService: ConfigService<ApiCoreEnv, true>) {
    this.provider = this.configService.get('DOCUMENT_STORAGE_PROVIDER', { infer: true });
    this.storageRoot =
      this.configService.get('DOCUMENT_STORAGE_LOCAL_ROOT', { infer: true }) ??
      join(process.cwd(), '.runtime', 'driver-documents');
    this.s3Bucket = this.configService.get('DOCUMENT_STORAGE_S3_BUCKET', { infer: true });
    this.s3Endpoint = this.configService.get('DOCUMENT_STORAGE_S3_ENDPOINT', { infer: true });
    this.s3PublicBaseUrl = this.configService.get('DOCUMENT_STORAGE_S3_PUBLIC_BASE_URL', {
      infer: true,
    });
    this.s3ForcePathStyle = this.configService.get('DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE', {
      infer: true,
    });

    if (this.provider === 's3') {
      this.s3Client = new S3Client({
        region: this.configService.get('DOCUMENT_STORAGE_S3_REGION', { infer: true }),
        endpoint: this.s3Endpoint,
        forcePathStyle: this.s3ForcePathStyle,
        credentials: {
          accessKeyId: this.configService.get('DOCUMENT_STORAGE_S3_ACCESS_KEY_ID', {
            infer: true,
          }) as string,
          secretAccessKey: this.configService.get('DOCUMENT_STORAGE_S3_SECRET_ACCESS_KEY', {
            infer: true,
          }) as string,
        },
      });
    }
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<StoredDocumentFile> {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

    if (this.provider === 's3') {
      await this.s3Client?.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: storageKey,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      return {
        storageKey,
        storageUrl: this.buildS3StorageUrl(storageKey),
      };
    }

    await mkdir(this.storageRoot, { recursive: true });
    const absolutePath = join(this.storageRoot, storageKey);
    await writeFile(absolutePath, buffer);
    return { storageKey, storageUrl: `file://${absolutePath}` };
  }

  async readFile(storageKey: string): Promise<Buffer> {
    if (this.provider === 's3') {
      try {
        const response = await this.s3Client?.send(
          new GetObjectCommand({
            Bucket: this.s3Bucket,
            Key: storageKey,
          }),
        );

        if (!response?.Body) {
          throw new Error('Missing object body');
        }

        return await this.streamToBuffer(response.Body);
      } catch {
        throw new NotFoundException('Document content is no longer available.');
      }
    }

    try {
      return await readFile(join(this.storageRoot, storageKey));
    } catch {
      throw new NotFoundException('Document content is no longer available.');
    }
  }

  async deleteFile(storageKey?: string | null): Promise<void> {
    if (!storageKey) return;

    if (this.provider === 's3') {
      try {
        await this.s3Client?.send(
          new DeleteObjectCommand({
            Bucket: this.s3Bucket,
            Key: storageKey,
          }),
        );
      } catch {
        // Best-effort cleanup only.
      }
      return;
    }

    try {
      await unlink(join(this.storageRoot, storageKey));
    } catch {
      // Best-effort cleanup only.
    }
  }

  private buildS3StorageUrl(storageKey: string): string {
    if (this.s3PublicBaseUrl) {
      return `${this.s3PublicBaseUrl.replace(/\/$/, '')}/${storageKey}`;
    }

    const endpoint = (this.s3Endpoint ?? '').replace(/\/$/, '');
    const encodedKey = storageKey
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    if (this.s3ForcePathStyle) {
      return `${endpoint}/${this.s3Bucket}/${encodedKey}`;
    }

    const endpointUrl = new URL(endpoint);
    return `${endpointUrl.protocol}//${this.s3Bucket}.${endpointUrl.host}/${encodedKey}`;
  }

  private async streamToBuffer(body: unknown): Promise<Buffer> {
    if (body instanceof Readable) {
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }

    if (body && typeof body === 'object' && 'transformToByteArray' in body) {
      const bytes = await (
        body as {
          transformToByteArray: () => Promise<Uint8Array>;
        }
      ).transformToByteArray();
      return Buffer.from(bytes);
    }

    if (body instanceof Uint8Array) {
      return Buffer.from(body);
    }

    throw new NotFoundException('Document content is no longer available.');
  }
}
