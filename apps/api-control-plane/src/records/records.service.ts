import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../database/prisma.service';
import { ControlPlaneDocumentStorageService } from './document-storage.service';

const PLATFORM_ISSUER = {
  productName: 'Mobiris',
  legalName: 'Growth Figures Limited',
  jurisdiction: 'Nigeria',
  website: 'growthfigures.com',
} as const;

@Injectable()
export class ControlPlaneRecordsService {
  private readonly signatureVersion = 'mobility-os-control-plane-v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: ControlPlaneDocumentStorageService,
  ) {}

  private get prismaClient(): PrismaService & {
    cpIssuedDocument: Prisma.CpIssuedDocumentDelegate;
    cpDispute: Prisma.CpDisputeDelegate;
    cpDisputeTimeline: Prisma.CpDisputeTimelineDelegate;
    cpDisputeEvidence: Prisma.CpDisputeEvidenceDelegate;
    cpEvidenceRecord: Prisma.CpEvidenceRecordDelegate;
  } {
    return this.prisma as PrismaService & {
      cpIssuedDocument: Prisma.CpIssuedDocumentDelegate;
      cpDispute: Prisma.CpDisputeDelegate;
      cpDisputeTimeline: Prisma.CpDisputeTimelineDelegate;
      cpDisputeEvidence: Prisma.CpDisputeEvidenceDelegate;
      cpEvidenceRecord: Prisma.CpEvidenceRecordDelegate;
    };
  }

  async listDocuments(filters: {
    tenantId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    documentType?: string;
  } = {}) {
    return this.prismaClient.cpIssuedDocument.findMany({
      where: {
        ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters.relatedEntityType ? { relatedEntityType: filters.relatedEntityType } : {}),
        ...(filters.relatedEntityId ? { relatedEntityId: filters.relatedEntityId } : {}),
        ...(filters.documentType ? { documentType: filters.documentType } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async getDocument(id: string) {
    const document = await this.prismaClient.cpIssuedDocument.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document '${id}' not found`);
    }
    return document;
  }

  async readDocumentContent(id: string) {
    const document = await this.getDocument(id);
    return this.storageService.readFile(document.storageKey);
  }

  async getDispute(id: string) {
    const dispute = await this.prismaClient.cpDispute.findUnique({
      where: { id },
      include: {
        timeline: { orderBy: { createdAt: 'asc' } },
        evidence: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute '${id}' not found`);
    }
    return dispute;
  }

  async issueDocument(input: {
    tenantId?: string | null;
    documentType: string;
    issuerType: string;
    issuerId?: string | null;
    recipientType?: string | null;
    recipientId?: string | null;
    relatedEntityType: string;
    relatedEntityId: string;
    title: string;
    subjectLines: string[];
    canonicalPayload: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  }) {
    const canonical = this.canonicalize(input.canonicalPayload);
    const fingerprint = this.hashPayload({
      canonical,
      documentType: input.documentType,
      issuerType: input.issuerType,
      issuerId: input.issuerId ?? null,
      version: this.signatureVersion,
    });
    const signedAt = new Date();
    const verificationReference = `${input.documentType}:${fingerprint.slice(0, 16)}`;
    const issuerLines =
      input.issuerType === 'platform'
        ? [
            '',
            `Issued by: ${PLATFORM_ISSUER.productName}`,
            `Legal issuer: ${PLATFORM_ISSUER.legalName}`,
            `Registered in: ${PLATFORM_ISSUER.jurisdiction}`,
            `Website: ${PLATFORM_ISSUER.website}`,
          ]
        : [];
    const pdf = this.renderPdf([
      input.title,
      '',
      ...input.subjectLines,
      ...issuerLines,
      '',
      `Fingerprint: ${fingerprint}`,
      `Signature version: ${this.signatureVersion}`,
      `Signed at: ${signedAt.toISOString()}`,
      `Verification ref: ${verificationReference}`,
    ]);
    const fileName = `${input.documentType}-${Date.now()}.pdf`;
    const uploaded = await this.storageService.uploadFile(pdf, fileName);
    const created = await this.prismaClient.cpIssuedDocument.create({
      data: {
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        documentNumber: this.buildCode(input.documentType.includes('invoice') ? 'INV' : 'RCT'),
        documentType: input.documentType,
        issuerType: input.issuerType,
        ...(input.issuerId ? { issuerId: input.issuerId } : {}),
        ...(input.recipientType ? { recipientType: input.recipientType } : {}),
        ...(input.recipientId ? { recipientId: input.recipientId } : {}),
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        fingerprint,
        signatureVersion: this.signatureVersion,
        signedAt,
        signedBySystem: 'api-control-plane',
        verificationReference,
        fileName,
        contentType: 'application/pdf',
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash: uploaded.fileHash,
        canonicalPayload: JSON.parse(canonical) as Prisma.InputJsonValue,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });
    await this.prismaClient.cpEvidenceRecord.create({
      data: {
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        actorType: 'system',
        actorId: 'api-control-plane',
        evidenceType: input.documentType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        sourceEntityType: 'document',
        sourceEntityId: created.id,
        fileName,
        contentType: 'application/pdf',
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash: uploaded.fileHash,
        integrityHash: fingerprint,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });
    return created;
  }

  async listDisputes(filters: {
    tenantId?: string;
    status?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  } = {}) {
    return this.prismaClient.cpDispute.findMany({
      where: {
        ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.relatedEntityType ? { relatedEntityType: filters.relatedEntityType } : {}),
        ...(filters.relatedEntityId ? { relatedEntityId: filters.relatedEntityId } : {}),
      },
      include: {
        timeline: { orderBy: { createdAt: 'asc' } },
        evidence: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async createDispute(input: {
    tenantId?: string | null;
    disputeType: string;
    relatedEntityType: string;
    relatedEntityId: string;
    claimantType: string;
    claimantId: string;
    respondentType: string;
    respondentId?: string | null;
    title: string;
    reasonCode: string;
    narrative: string;
    priority?: string;
  }) {
    const dispute = await this.prismaClient.cpDispute.create({
      data: {
        disputeCode: this.buildCode('DSP'),
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        disputeType: input.disputeType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        claimantType: input.claimantType,
        claimantId: input.claimantId,
        respondentType: input.respondentType,
        ...(input.respondentId ? { respondentId: input.respondentId } : {}),
        title: input.title,
        reasonCode: input.reasonCode,
        narrative: input.narrative,
        priority: input.priority ?? 'normal',
      },
    });
    await this.prismaClient.cpDisputeTimeline.create({
      data: {
        disputeId: dispute.id,
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        actorType: input.claimantType,
        actorId: input.claimantId,
        actionType: 'dispute_opened',
        message: input.title,
      },
    });
    return dispute;
  }

  async addTimelineEntry(input: {
    disputeId: string;
    tenantId?: string | null;
    actorType: string;
    actorId?: string | null;
    actionType: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prismaClient.cpDisputeTimeline.create({
      data: {
        disputeId: input.disputeId,
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        actorType: input.actorType,
        ...(input.actorId ? { actorId: input.actorId } : {}),
        actionType: input.actionType,
        message: input.message,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });
  }

  async uploadDisputeEvidence(input: {
    disputeId: string;
    tenantId?: string | null;
    uploadedByType: string;
    uploadedById?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    description?: string;
  }) {
    const buffer = Buffer.from(input.fileBase64, 'base64');
    const uploaded = await this.storageService.uploadFile(buffer, input.fileName);
    const fileHash = uploaded.fileHash;
    const integrityHash = this.hashPayload({
      disputeId: input.disputeId,
      evidenceType: input.evidenceType,
      fileHash,
      uploadedByType: input.uploadedByType,
      uploadedById: input.uploadedById ?? null,
    });

    const created = await this.prismaClient.cpDisputeEvidence.create({
      data: {
        disputeId: input.disputeId,
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        uploadedByType: input.uploadedByType,
        ...(input.uploadedById ? { uploadedById: input.uploadedById } : {}),
        evidenceType: input.evidenceType,
        ...(input.description ? { description: input.description } : {}),
        fileName: input.fileName,
        contentType: input.contentType,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash,
        integrityHash,
      },
    });

    await this.prismaClient.cpEvidenceRecord.create({
      data: {
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
        actorType: input.uploadedByType,
        ...(input.uploadedById ? { actorId: input.uploadedById } : {}),
        evidenceType: input.evidenceType,
        relatedEntityType: 'dispute',
        relatedEntityId: input.disputeId,
        sourceEntityType: 'dispute_evidence',
        sourceEntityId: created.id,
        fileName: input.fileName,
        contentType: input.contentType,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash,
        integrityHash,
      },
    });

    await this.addTimelineEntry({
      disputeId: input.disputeId,
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      actorType: input.uploadedByType,
      ...(input.uploadedById ? { actorId: input.uploadedById } : {}),
      actionType: 'evidence_uploaded',
      message: input.description?.trim() || `${input.evidenceType} uploaded`,
      metadata: {
        evidenceId: created.id,
        fileHash,
      },
    });

    return created;
  }

  async resolveDispute(input: {
    disputeId: string;
    tenantId?: string | null;
    actorType: string;
    actorId: string;
    resolutionSummary: Prisma.InputJsonValue;
    finalStatus?: string;
    finalAmountMinorUnits?: number;
    currency?: string;
  }) {
    const updated = await this.prismaClient.cpDispute.update({
      where: { id: input.disputeId },
      data: {
        status: input.finalStatus ?? 'resolved',
        resolvedAt: new Date(),
        resolvedByType: input.actorType,
        resolvedById: input.actorId,
        resolutionSummary: input.resolutionSummary,
        ...(input.finalAmountMinorUnits !== undefined
          ? { finalAmountMinorUnits: input.finalAmountMinorUnits }
          : {}),
        ...(input.currency ? { currency: input.currency } : {}),
      },
    });

    await this.addTimelineEntry({
      disputeId: input.disputeId,
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      actorType: input.actorType,
      actorId: input.actorId,
      actionType: 'dispute_resolved',
      message: 'Dispute resolved',
      metadata: input.resolutionSummary,
    });

    await this.issueDocument({
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      documentType: 'dispute_resolution_summary',
      issuerType: input.actorType,
      issuerId: input.actorId,
      recipientType: input.tenantId ? 'tenant' : 'platform',
      recipientId: input.tenantId ?? 'platform',
      relatedEntityType: 'dispute',
      relatedEntityId: input.disputeId,
      title: `Dispute Resolution Summary ${updated.disputeCode}`,
      subjectLines: [
        `Dispute code: ${updated.disputeCode}`,
        `Status: ${updated.status}`,
        `Resolved at: ${updated.resolvedAt?.toISOString() ?? 'Not recorded'}`,
        `Resolution: ${this.canonicalize(input.resolutionSummary)}`,
      ],
      canonicalPayload: {
        disputeId: updated.id,
        disputeCode: updated.disputeCode,
        status: updated.status,
        resolutionSummary: input.resolutionSummary,
      },
    });

    return updated;
  }

  private buildCode(prefix: string) {
    return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }

  private hashPayload(payload: unknown) {
    return createHash('sha256').update(this.canonicalize(payload)).digest('hex');
  }

  private canonicalize(value: unknown): string {
    return JSON.stringify(this.sortJson(value));
  }

  private sortJson(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.sortJson(item));
    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = this.sortJson((value as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return value;
  }

  private renderPdf(lines: string[]) {
    const escaped = lines
      .map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
      .map((line) => `(${line}) Tj`)
      .join('\nT*\n');
    const stream = `BT\n/F1 12 Tf\n50 780 Td\n14 TL\n${escaped}\nET`;
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const object of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${object}\n`;
    }
    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
  }
}
