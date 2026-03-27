import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../database/prisma.service';
import { DocumentStorageService } from '../drivers/document-storage.service';

type DocumentPayload = {
  tenantId: string;
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
};

@Injectable()
export class RecordsService {
  private readonly signatureVersion = 'mobility-os-records-v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly documentStorage: DocumentStorageService,
  ) {}

  private get prismaClient(): PrismaService & {
    operationalIssuedDocument: PrismaService['$extends'] extends never
      ? never
      : Prisma.OperationalIssuedDocumentDelegate;
    operationalDispute: Prisma.OperationalDisputeDelegate;
    operationalDisputeTimeline: Prisma.OperationalDisputeTimelineDelegate;
    operationalDisputeEvidence: Prisma.OperationalDisputeEvidenceDelegate;
    operationalEvidenceRecord: Prisma.OperationalEvidenceRecordDelegate;
  } {
    return this.prisma as PrismaService & {
      operationalIssuedDocument: Prisma.OperationalIssuedDocumentDelegate;
      operationalDispute: Prisma.OperationalDisputeDelegate;
      operationalDisputeTimeline: Prisma.OperationalDisputeTimelineDelegate;
      operationalDisputeEvidence: Prisma.OperationalDisputeEvidenceDelegate;
      operationalEvidenceRecord: Prisma.OperationalEvidenceRecordDelegate;
    };
  }

  async listDocuments(
    tenantId: string,
    filters: { relatedEntityType?: string; relatedEntityId?: string; documentType?: string } = {},
  ) {
    return this.prismaClient.operationalIssuedDocument.findMany({
      where: {
        tenantId,
        ...(filters.relatedEntityType ? { relatedEntityType: filters.relatedEntityType } : {}),
        ...(filters.relatedEntityId ? { relatedEntityId: filters.relatedEntityId } : {}),
        ...(filters.documentType ? { documentType: filters.documentType } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async getDocument(tenantId: string, id: string) {
    const document = await this.prismaClient.operationalIssuedDocument.findFirst({
      where: { tenantId, id },
    });
    if (!document) {
      throw new NotFoundException(`Document '${id}' not found`);
    }
    return document;
  }

  async readDocumentContent(tenantId: string, id: string) {
    const document = await this.getDocument(tenantId, id);
    return this.documentStorage.readFile(document.storageKey);
  }

  async createDispute(input: {
    tenantId: string;
    driverId?: string | null;
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
    metadata?: Prisma.InputJsonValue;
  }) {
    const disputeCode = this.buildCode('DSP');
    const created = await this.prismaClient.operationalDispute.create({
      data: {
        disputeCode,
        tenantId: input.tenantId,
        ...(input.driverId ? { driverId: input.driverId } : {}),
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
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });
    await this.addTimelineEntry({
      tenantId: input.tenantId,
      disputeId: created.id,
      actorType: input.claimantType,
      actorId: input.claimantId,
      actionType: 'dispute_opened',
      message: input.title,
      metadata: {
        reasonCode: input.reasonCode,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
      },
    });
    await this.auditService.recordTenantAction({
      tenantId: input.tenantId,
      entityType: 'dispute',
      entityId: created.id,
      actorId: input.claimantId,
      action: 'dispute_opened',
      metadata: {
        disputeCode,
        disputeType: input.disputeType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
      },
    });
    return created;
  }

  async listDisputes(
    tenantId: string,
    filters: { status?: string; relatedEntityType?: string; relatedEntityId?: string } = {},
  ) {
    return this.prismaClient.operationalDispute.findMany({
      where: {
        tenantId,
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

  async getDispute(tenantId: string, id: string) {
    const dispute = await this.prismaClient.operationalDispute.findFirst({
      where: { tenantId, id },
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

  async addTimelineEntry(input: {
    tenantId: string;
    disputeId: string;
    actorType: string;
    actorId?: string | null;
    actionType: string;
    message: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prismaClient.operationalDisputeTimeline.create({
      data: {
        tenantId: input.tenantId,
        disputeId: input.disputeId,
        actorType: input.actorType,
        ...(input.actorId ? { actorId: input.actorId } : {}),
        actionType: input.actionType,
        message: input.message,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });
  }

  async uploadDisputeEvidence(input: {
    tenantId: string;
    disputeId: string;
    uploadedByType: string;
    uploadedById?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
    fileBase64: string;
    description?: string;
  }) {
    const buffer = Buffer.from(input.fileBase64, 'base64');
    const fileHash = this.hashBuffer(buffer);
    const uploaded = await this.documentStorage.uploadFile(buffer, input.fileName, input.contentType);
    const integrityHash = this.hashPayload({
      disputeId: input.disputeId,
      fileHash,
      evidenceType: input.evidenceType,
      uploadedByType: input.uploadedByType,
      uploadedById: input.uploadedById ?? null,
    });

    const record = await this.prismaClient.operationalDisputeEvidence.create({
      data: {
        disputeId: input.disputeId,
        tenantId: input.tenantId,
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

    await this.prismaClient.operationalEvidenceRecord.create({
      data: {
        tenantId: input.tenantId,
        actorType: input.uploadedByType,
        ...(input.uploadedById ? { actorId: input.uploadedById } : {}),
        evidenceType: input.evidenceType,
        relatedEntityType: 'dispute',
        relatedEntityId: input.disputeId,
        fileName: input.fileName,
        contentType: input.contentType,
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash,
        integrityHash,
      },
    });

    await this.addTimelineEntry({
      tenantId: input.tenantId,
      disputeId: input.disputeId,
      actorType: input.uploadedByType,
      ...(input.uploadedById ? { actorId: input.uploadedById } : {}),
      actionType: 'evidence_uploaded',
      message: input.description?.trim() || `${input.evidenceType} uploaded`,
      metadata: {
        evidenceId: record.id,
        fileHash,
      },
    });
    return record;
  }

  async resolveDispute(input: {
    tenantId: string;
    disputeId: string;
    actorType: string;
    actorId: string;
    resolutionSummary: Prisma.InputJsonValue;
    finalStatus?: string;
    finalAmountMinorUnits?: number;
    currency?: string;
  }) {
    const updated = await this.prismaClient.operationalDispute.update({
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
      tenantId: input.tenantId,
      disputeId: input.disputeId,
      actorType: input.actorType,
      actorId: input.actorId,
      actionType: 'dispute_resolved',
      message: 'Dispute resolved',
      metadata: input.resolutionSummary,
    });

    await this.issueDocument({
      tenantId: input.tenantId,
      documentType: 'dispute_resolution_summary',
      issuerType: input.actorType,
      issuerId: input.actorId,
      recipientType: 'tenant',
      recipientId: input.tenantId,
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

  async issueRemittanceReceipt(tenantId: string, remittanceId: string) {
    const remittance = await this.prisma.remittance.findUnique({ where: { id: remittanceId } });
    if (!remittance || remittance.tenantId !== tenantId) {
      throw new NotFoundException(`Remittance '${remittanceId}' not found`);
    }
    const assignment = await this.prisma.assignment.findUnique({ where: { id: remittance.assignmentId } });
    const driver = await this.prisma.driver.findUnique({ where: { id: remittance.driverId } });
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: remittance.vehicleId } });

    return this.issueDocument({
      tenantId,
      documentType: 'remittance_confirmation_receipt',
      issuerType: 'tenant',
      issuerId: tenantId,
      recipientType: 'driver',
      recipientId: remittance.driverId,
      relatedEntityType: 'remittance',
      relatedEntityId: remittance.id,
      title: `Remittance Confirmation Receipt ${remittance.id.slice(-6).toUpperCase()}`,
      subjectLines: [
        `Assignment: ${remittance.assignmentId}`,
        `Driver: ${driver ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim() : remittance.driverId}`,
        `Vehicle: ${vehicle?.plate ?? remittance.vehicleId}`,
        `Amount submitted: ${remittance.amountMinorUnits} ${remittance.currency}`,
        `Amount confirmed: ${remittance.amountMinorUnits} ${remittance.currency}`,
        `Variance: ${remittance.shortfallAmountMinorUnits ?? 0} ${remittance.currency}`,
        `Confirmed at: ${remittance.paidDate ?? 'Not recorded'}`,
        `Assignment acknowledged at: ${assignment?.driverConfirmedAt?.toISOString() ?? 'Not recorded'}`,
      ],
      canonicalPayload: {
        remittanceId: remittance.id,
        assignmentId: remittance.assignmentId,
        driverId: remittance.driverId,
        vehicleId: remittance.vehicleId,
        amountMinorUnits: remittance.amountMinorUnits,
        currency: remittance.currency,
        paidDate: remittance.paidDate,
        status: remittance.status,
      },
      metadata: {
        paidDate: remittance.paidDate,
        remittanceStatus: remittance.status,
      },
    });
  }

  async issueDocument(input: DocumentPayload) {
    const canonical = this.canonicalize(input.canonicalPayload);
    const fingerprint = this.hashPayload({
      canonical,
      issuerType: input.issuerType,
      issuerId: input.issuerId ?? null,
      documentType: input.documentType,
      version: this.signatureVersion,
    });
    const signedAt = new Date();
    const verificationReference = `${input.documentType}:${fingerprint.slice(0, 16)}`;
    const pdf = this.renderPdf([
      input.title,
      '',
      ...input.subjectLines,
      '',
      `Fingerprint: ${fingerprint}`,
      `Signature version: ${this.signatureVersion}`,
      `Signed at: ${signedAt.toISOString()}`,
      `Verification ref: ${verificationReference}`,
    ]);
    const fileName = `${input.documentType}-${Date.now()}.pdf`;
    const uploaded = await this.documentStorage.uploadFile(pdf, fileName, 'application/pdf');
    const fileHash = this.hashBuffer(pdf);
    const documentNumber = this.buildCode(this.prefixForDocument(input.documentType));

    const created = await this.prismaClient.operationalIssuedDocument.create({
      data: {
        tenantId: input.tenantId,
        documentNumber,
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
        signedBySystem: 'api-core',
        verificationReference,
        fileName,
        contentType: 'application/pdf',
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash,
        canonicalPayload: JSON.parse(canonical) as Prisma.InputJsonValue,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });

    await this.prismaClient.operationalEvidenceRecord.create({
      data: {
        tenantId: input.tenantId,
        actorType: 'system',
        actorId: 'api-core',
        evidenceType: input.documentType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        sourceEntityType: 'document',
        sourceEntityId: created.id,
        fileName,
        contentType: 'application/pdf',
        storageKey: uploaded.storageKey,
        fileUrl: uploaded.storageUrl,
        fileHash,
        integrityHash: fingerprint,
        ...(input.metadata ? { metadata: input.metadata } : {}),
      },
    });

    await this.auditService.recordTenantAction({
      tenantId: input.tenantId,
      entityType: 'document',
      entityId: created.id,
      action: 'document_fingerprint_generated',
      metadata: {
        documentNumber,
        documentType: input.documentType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        fingerprint,
      },
    });

    return created;
  }

  private prefixForDocument(documentType: string) {
    if (documentType.includes('receipt')) return 'RCT';
    if (documentType.includes('invoice')) return 'INV';
    if (documentType.includes('dispute')) return 'DSPDOC';
    return 'DOC';
  }

  private buildCode(prefix: string) {
    return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }

  private hashBuffer(buffer: Buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private hashPayload(payload: unknown) {
    return createHash('sha256').update(this.canonicalize(payload)).digest('hex');
  }

  private canonicalize(value: unknown): string {
    return JSON.stringify(this.sortJson(value));
  }

  private sortJson(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortJson(item));
    }
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

  private renderPdf(lines: string[]): Buffer {
    const escaped = lines
      .map((line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'))
      .map((line) => `(${line}) Tj`)
      .join('\nT*\n');
    const stream = `BT
/F1 12 Tf
50 780 Td
14 TL
${escaped}
ET`;
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
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let index = 1; index < offsets.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'utf8');
  }
}
