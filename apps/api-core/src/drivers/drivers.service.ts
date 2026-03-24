import {
  DRIVER_STATUS_CODES,
  getDocumentType,
  isCountrySupported,
  normalizePhoneNumberForCountry,
} from '@mobility-os/domain-config';
import { asTenantId, assertTenantOwnership } from '@mobility-os/tenancy-domain';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { JwtService } from '@nestjs/jwt';
import { Prisma, type Driver } from '@prisma/client';
import type { PaginatedResponse } from '../common/dto/paginated-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { IntelligenceClient } from '../intelligence/intelligence.client';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthEmailService } from '../notifications/auth-email.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { DocumentStorageService } from './document-storage.service';
import type { CreateDriverDocumentDto } from './dto/create-driver-document.dto';
import type { CreateDriverDto } from './dto/create-driver.dto';
import type { CreateOrUpdateDriverGuarantorDto } from './dto/create-or-update-driver-guarantor.dto';
import type { ResolveDriverIdentityDto } from './dto/resolve-driver-identity.dto';

type DriverWithIdentityState = Driver & {
  identityStatus: string;
  identityReviewCaseId?: string | null;
  identityReviewStatus?: string | null;
  identityLastDecision?: string | null;
  identityVerificationConfidence?: number | null;
  identityLastVerifiedAt?: Date | null;
  identityLivenessPassed?: boolean | null;
  identityLivenessProvider?: string | null;
  identityLivenessConfidence?: number | null;
  identityLivenessReason?: string | null;
};

type DriverIntelligenceSummary = {
  globalRiskScore?: number | undefined;
  riskBand?: string | undefined;
  isWatchlisted?: boolean | undefined;
  duplicateIdentityFlag?: boolean | undefined;
  verificationConfidence?: number | undefined;
  verificationStatus?: string | undefined;
  verificationProvider?: string | undefined;
  verificationCountryCode?: string | undefined;
};

type DriverGuarantorSummary = {
  guarantorPersonId?: string | null;
  guarantorRiskBand?: string | null;
  guarantorIsWatchlisted?: boolean | null;
  guarantorIsAlsoDriver?: boolean;
  hasGuarantor: boolean;
  guarantorStatus?: string | null;
  guarantorDisconnectedAt?: Date | null;
};

type DriverDocumentSummary = {
  hasApprovedLicence: boolean;
  pendingDocumentCount: number;
  rejectedDocumentCount: number;
  expiredDocumentCount: number;
};

type DriverMobileAccessSummary = {
  hasMobileAccess: boolean;
  mobileAccessStatus?: string | null;
};

type DriverReadinessSummary = {
  activationReadiness: 'ready' | 'partially_ready' | 'not_ready';
  activationReadinessReasons: string[];
  assignmentReadiness: 'ready' | 'partially_ready' | 'not_ready';
  assignmentReadinessReasons: string[];
};

type DriverIdentityResolutionResult = {
  decision: string;
  personId?: string;
  reviewCaseId?: string;
  providerLookupStatus?: string;
  providerVerificationStatus?: string;
  providerName?: string;
  matchedIdentifierType?: string;
  isVerifiedMatch?: boolean;
  verifiedProfile?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
  };
  globalRiskScore?: number;
  riskBand?: string;
  isWatchlisted?: boolean;
  hasDuplicateIdentityFlag?: boolean;
  fraudIndicatorCount?: number;
  verificationConfidence?: number;
  livenessPassed?: boolean;
  livenessProviderName?: string;
  livenessConfidenceScore?: number;
  livenessReason?: string;
};

type DriverGuarantorRecord = {
  id: string;
  tenantId: string;
  driverId: string;
  personId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  countryCode?: string | null;
  relationship?: string | null;
  status: string;
  disconnectedAt?: Date | null;
  disconnectedReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_DOCUMENT_FILE_BYTES_FALLBACK = 10 * 1024 * 1024;
const ALLOWED_DRIVER_DOCUMENT_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

type MobileAccessUserRecord = {
  id: string;
  tenantId: string;
  driverId?: string | null;
  email: string;
  phone?: string | null;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type DriverDocumentRecord = {
  id: string;
  tenantId: string;
  driverId: string;
  documentType: string;
  fileName: string;
  contentType: string;
  fileDataUrl?: string | null;
  storageKey?: string | null;
  storageUrl?: string | null;
  uploadedBy: string;
  status: string;
  expiresAt?: Date | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const DRIVER_LICENCE_DOCUMENT_TYPE = 'drivers-license';

// TODO: Remove the narrow write casts in this service after the api-core Prisma
// generation paths are unified. This repo currently has a stale secondary client
// under src/generated/prisma while application code imports @prisma/client.
// Runtime generation includes the new driver identity fields, but TypeScript
// write inputs can lag behind until the client path inconsistency is cleaned up.

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligenceClient: IntelligenceClient,
    private readonly jwtService: JwtService,
    private readonly authEmailService: AuthEmailService,
    private readonly documentStorageService: DocumentStorageService,
  ) {}

  private readonly selfServicePurpose = 'driver_self_service';

  private get driverDocuments(): {
    findMany(args: {
      where: { tenantId: string; driverId?: string | { in: string[] } };
      orderBy?: { createdAt: 'desc' };
      select?: { driverId?: boolean; documentType?: boolean; status?: boolean };
    }): Promise<
      Array<
        Pick<DriverDocumentRecord, 'driverId' | 'documentType' | 'status'> | DriverDocumentRecord
      >
    >;
    create(args: {
      data: Omit<DriverDocumentRecord, 'id' | 'createdAt' | 'updatedAt'>;
    }): Promise<DriverDocumentRecord>;
    findUnique(args: { where: { id: string } }): Promise<DriverDocumentRecord | null>;
    findFirst(args: {
      where: { tenantId: string; driverId: string; documentType: string; status: string };
    }): Promise<DriverDocumentRecord | null>;
    update(args: {
      where: { id: string };
      data: Partial<
        Pick<DriverDocumentRecord, 'status' | 'expiresAt' | 'reviewedBy' | 'reviewedAt'>
      >;
    }): Promise<DriverDocumentRecord>;
    updateMany(args: {
      where: {
        tenantId: string;
        status: string;
        expiresAt: { lt: Date };
        driverId?: { in: string[] };
      };
      data: Pick<DriverDocumentRecord, 'status'>;
    }): Promise<{ count: number }>;
  } {
    // TODO: Remove this narrow delegate cast after the repo's Prisma client path
    // inconsistency is resolved. Runtime Prisma includes the driver document
    // lifecycle fields, but api-core type-checking can lag behind schema additions.
    return (
      this.prisma as never as {
        driverDocument: {
          findMany(args: {
            where: { tenantId: string; driverId?: string | { in: string[] } };
            orderBy?: { createdAt: 'desc' };
            select?: { driverId?: boolean; documentType?: boolean; status?: boolean };
          }): Promise<
            Array<
              | Pick<DriverDocumentRecord, 'driverId' | 'documentType' | 'status'>
              | DriverDocumentRecord
            >
          >;
          create(args: {
            data: Omit<DriverDocumentRecord, 'id' | 'createdAt' | 'updatedAt'>;
          }): Promise<DriverDocumentRecord>;
          findUnique(args: { where: { id: string } }): Promise<DriverDocumentRecord | null>;
          findFirst(args: {
            where: { tenantId: string; driverId: string; documentType: string; status: string };
          }): Promise<DriverDocumentRecord | null>;
          update(args: {
            where: { id: string };
            data: Partial<
              Pick<DriverDocumentRecord, 'status' | 'expiresAt' | 'reviewedBy' | 'reviewedAt'>
            >;
          }): Promise<DriverDocumentRecord>;
          updateMany(args: {
            where: {
              tenantId: string;
              status: string;
              expiresAt: { lt: Date };
              driverId?: { in: string[] };
            };
            data: Pick<DriverDocumentRecord, 'status'>;
          }): Promise<{ count: number }>;
        };
      }
    ).driverDocument;
  }

  private get driverGuarantors(): {
    findUnique(args: { where: { driverId: string } }): Promise<DriverGuarantorRecord | null>;
    findMany(args: { where: { tenantId: string; driverId?: { in: string[] } } }): Promise<
      DriverGuarantorRecord[]
    >;
    upsert(args: {
      where: { driverId: string };
      create: Omit<DriverGuarantorRecord, 'id' | 'createdAt' | 'updatedAt'>;
      update: Pick<
        DriverGuarantorRecord,
        | 'name'
        | 'phone'
        | 'countryCode'
        | 'relationship'
        | 'status'
        | 'disconnectedAt'
        | 'disconnectedReason'
      >;
    }): Promise<DriverGuarantorRecord>;
    update(args: {
      where: { driverId: string };
      data: Partial<
        Pick<DriverGuarantorRecord, 'status' | 'disconnectedAt' | 'disconnectedReason' | 'personId'>
      >;
    }): Promise<DriverGuarantorRecord>;
  } {
    // TODO: Remove this narrow delegate cast after the repo's Prisma client path
    // inconsistency is resolved. The runtime client has driverGuarantor, but
    // api-core type-checking still lags behind generated schema additions.
    return (
      this.prisma as never as {
        driverGuarantor: {
          findUnique(args: { where: { driverId: string } }): Promise<DriverGuarantorRecord | null>;
          findMany(args: { where: { tenantId: string; driverId?: { in: string[] } } }): Promise<
            DriverGuarantorRecord[]
          >;
          upsert(args: {
            where: { driverId: string };
            create: Omit<DriverGuarantorRecord, 'id' | 'createdAt' | 'updatedAt'>;
            update: Pick<
              DriverGuarantorRecord,
              | 'name'
              | 'phone'
              | 'countryCode'
              | 'relationship'
              | 'status'
              | 'disconnectedAt'
              | 'disconnectedReason'
            >;
          }): Promise<DriverGuarantorRecord>;
          update(args: {
            where: { driverId: string };
            data: Partial<
              Pick<
                DriverGuarantorRecord,
                'status' | 'disconnectedAt' | 'disconnectedReason' | 'personId'
              >
            >;
          }): Promise<DriverGuarantorRecord>;
        };
      }
    ).driverGuarantor;
  }

  async list(
    tenantId: string,
    input: {
      fleetId?: string;
      q?: string;
      status?: string;
      identityStatus?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<
    PaginatedResponse<
      DriverWithIdentityState &
        DriverIntelligenceSummary &
        DriverGuarantorSummary &
        DriverDocumentSummary &
        DriverMobileAccessSummary &
        DriverReadinessSummary
    >
  > {
    const page = input.page ?? 1;
    const limit = input.limit ?? 50;
    const searchQuery = input.q?.trim();
    const where: Prisma.DriverWhereInput = {
      tenantId,
      ...(input.fleetId ? { fleetId: input.fleetId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.identityStatus ? { identityStatus: input.identityStatus } : {}),
      ...(searchQuery
        ? {
            OR: [
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } },
              { phone: { contains: searchQuery, mode: 'insensitive' } },
              { email: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [drivers, total] = await Promise.all([
      this.prisma.driver.findMany({
        where,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.driver.count({ where }),
    ]);

    const enrichedDrivers = await this.enrichDriversWithRisk(drivers);
    const driversWithGuarantors = await this.attachGuarantorSummariesSafely(
      tenantId,
      enrichedDrivers,
    );
    const driversWithDocuments = await this.attachDocumentSummariesSafely(
      tenantId,
      driversWithGuarantors,
    );
    const driversWithMobileAccess = await this.attachMobileAccessSummariesSafely(
      tenantId,
      driversWithDocuments,
    );
    return {
      data: await this.attachReadinessSummariesSafely(driversWithMobileAccess),
      total,
      page,
      limit,
    };
  }

  async findOne(
    tenantId: string,
    id: string,
  ): Promise<
    DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary &
      DriverReadinessSummary
  > {
    const driver = (await this.prisma.driver.findUnique({
      where: { id },
    })) as DriverWithIdentityState | null;

    if (!driver) {
      throw new NotFoundException(`Driver '${id}' not found`);
    }

    assertTenantOwnership(asTenantId(driver.tenantId), asTenantId(tenantId));

    const enrichedDriver = await this.enrichDriverWithRisk(driver);
    const [driverWithGuarantor] = await this.attachGuarantorSummaries(tenantId, [enrichedDriver]);
    const [driverWithDocuments] = await this.attachDocumentSummaries(tenantId, [
      driverWithGuarantor ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
      },
    ]);
    const [driverWithMobileAccess] = await this.attachMobileAccessSummaries(tenantId, [
      driverWithDocuments ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
      },
    ]);
    const [driverWithReadiness] = await this.attachReadinessSummaries([
      driverWithMobileAccess ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        hasMobileAccess: false,
        mobileAccessStatus: 'missing',
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
      },
    ]);
    return (
      driverWithReadiness ?? {
        ...enrichedDriver,
        hasGuarantor: false,
        guarantorStatus: null,
        guarantorDisconnectedAt: null,
        hasApprovedLicence: false,
        hasMobileAccess: false,
        mobileAccessStatus: 'missing',
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
        activationReadiness: 'not_ready',
        activationReadinessReasons: [],
        assignmentReadiness: 'not_ready',
        assignmentReadinessReasons: [],
      }
    );
  }

  async getSelfServiceContext(
    token: string,
  ): Promise<DriverWithIdentityState & DriverIntelligenceSummary> {
    const payload = await this.verifySelfServiceToken(token);
    return this.findOne(payload.tenantId, payload.driverId);
  }

  async getMobileAccess(
    tenantId: string,
    driverId: string,
  ): Promise<{
    linkedUser: MobileAccessUserRecord | null;
    suggestedUsers: Array<MobileAccessUserRecord & { matchReason?: string | null }>;
  }> {
    const driver = await this.findOne(tenantId, driverId);

    const linkedUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
      },
    });

    const normalizedEmail = driver.email?.trim().toLowerCase() ?? null;
    const normalizedPhone = driver.phone?.trim() ?? null;

    const [emailMatches, phoneMatches] = await Promise.all([
      normalizedEmail
        ? this.prisma.user.findMany({
            where: {
              tenantId,
              email: normalizedEmail,
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
      normalizedPhone
        ? this.prisma.user.findMany({
            where: {
              tenantId,
              phone: normalizedPhone,
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const suggestedUsers = [...emailMatches, ...phoneMatches]
      .filter((user, index, users) => users.findIndex((item) => item.id === user.id) === index)
      .filter((user) => user.id !== linkedUser?.id)
      .map((user) => ({
        ...user,
        matchReason:
          normalizedEmail && user.email === normalizedEmail
            ? 'Email matches this driver'
            : normalizedPhone && user.phone === normalizedPhone
              ? 'Phone matches this driver'
              : null,
      }));

    return {
      linkedUser,
      suggestedUsers,
    };
  }

  async linkUserToDriver(
    tenantId: string,
    driverId: string,
    userId: string,
  ): Promise<MobileAccessUserRecord> {
    const driver = await this.findOne(tenantId, driverId);
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User '${userId}' not found`);
    }

    if (!user.isActive) {
      throw new BadRequestException('Only active organisation users can be linked to a driver.');
    }

    if (user.driverId && user.driverId !== driver.id) {
      throw new ConflictException('This organisation user is already linked to another driver.');
    }

    const currentLinkedUser = await this.prisma.user.findFirst({
      where: {
        tenantId,
        driverId: driver.id,
      },
    });

    if (currentLinkedUser && currentLinkedUser.id !== user.id) {
      throw new ConflictException(
        'This driver already has a linked mobile access user. Disconnect it before linking another user.',
      );
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { driverId: driver.id, mobileAccessRevoked: false },
    });
  }

  async unlinkUserFromDriver(tenantId: string, driverId: string, userId: string): Promise<void> {
    const driver = await this.findOne(tenantId, driverId);
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user || user.driverId !== driver.id) {
      throw new NotFoundException('No linked organisation user was found for this driver.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { driverId: null },
    });
  }

  async sendSelfServiceLink(
    tenantId: string,
    id: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, id);

    if (!driver.email) {
      throw new BadRequestException(
        'Driver has no email; please add one before sending a self-service link.',
      );
    }

    const [token, otpCode] = await Promise.all([
      this.createSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'driver', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/driver-self-service?token=${encodeURIComponent(token)}`;

    await this.authEmailService.sendDriverSelfServiceVerificationEmail({
      email: driver.email,
      name: `${driver.firstName} ${driver.lastName}`,
      driverName: `${driver.firstName} ${driver.lastName}`,
      verificationUrl,
      otpCode,
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: driver.email,
      otpCode,
    };
  }

  async sendGuarantorSelfServiceLink(
    tenantId: string,
    driverId: string,
  ): Promise<{ delivery: 'email'; verificationUrl: string; destination: string; otpCode: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const guarantor = await this.driverGuarantors.findUnique({ where: { driverId: driver.id } });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    if (!guarantor.email) {
      throw new BadRequestException(
        'Guarantor has no email address; please add one before sending a verification link.',
      );
    }

    const [token, otpCode] = await Promise.all([
      this.createGuarantorSelfServiceToken(driver.tenantId, driver.id),
      this.createAndStoreSelfServiceOtp(driver.tenantId, 'guarantor', driver.id),
    ]);

    const verificationUrl = `${process.env.TENANT_WEB_URL ?? 'http://localhost:3000'}/guarantor-self-service?token=${encodeURIComponent(token)}`;

    await this.authEmailService.sendGuarantorSelfServiceVerificationEmail({
      email: guarantor.email,
      guarantorName: guarantor.name,
      driverName: `${driver.firstName} ${driver.lastName}`,
      verificationUrl,
      otpCode,
    });

    return {
      delivery: 'email',
      verificationUrl,
      destination: guarantor.email,
      otpCode,
    };
  }

  async exchangeDriverSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
    const normalizedCode = otpCode.trim().toUpperCase();
    const now = new Date();

    const otp = await this.prisma.selfServiceOtp.findUnique({
      where: { otpCode: normalizedCode },
    });

    if (!otp || otp.subjectType !== 'driver' || otp.usedAt !== null || otp.expiresAt < now) {
      throw new UnauthorizedException('This verification code is invalid or has expired.');
    }

    await this.prisma.selfServiceOtp.update({
      where: { id: otp.id },
      data: { usedAt: now },
    });

    const token = await this.createSelfServiceToken(otp.tenantId, otp.subjectId);
    return { token };
  }

  async exchangeGuarantorSelfServiceOtp(otpCode: string): Promise<{ token: string }> {
    const normalizedCode = otpCode.trim().toUpperCase();
    const now = new Date();

    const otp = await this.prisma.selfServiceOtp.findUnique({
      where: { otpCode: normalizedCode },
    });

    if (!otp || otp.subjectType !== 'guarantor' || otp.usedAt !== null || otp.expiresAt < now) {
      throw new UnauthorizedException('This verification code is invalid or has expired.');
    }

    await this.prisma.selfServiceOtp.update({
      where: { id: otp.id },
      data: { usedAt: now },
    });

    const token = await this.createGuarantorSelfServiceToken(otp.tenantId, otp.subjectId);
    return { token };
  }

  async getGuarantorSelfServiceContext(
    token: string,
  ): Promise<{
    guarantorName: string;
    guarantorPhone: string;
    guarantorEmail: string | null;
    guarantorCountryCode: string | null;
    guarantorRelationship: string | null;
    guarantorPersonId: string | null;
    guarantorStatus: string;
    driverName: string;
    driverId: string;
    tenantId: string;
  }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor is linked to this driver.');
    }

    return {
      guarantorName: guarantor.name,
      guarantorPhone: guarantor.phone,
      guarantorEmail: guarantor.email ?? null,
      guarantorCountryCode: guarantor.countryCode ?? null,
      guarantorRelationship: guarantor.relationship ?? null,
      guarantorPersonId: guarantor.personId ?? null,
      guarantorStatus: guarantor.status,
      driverName: `${driver.firstName} ${driver.lastName}`,
      driverId: driver.id,
      tenantId: driver.tenantId,
    };
  }

  async initializeGuarantorLivenessSessionFromSelfService(
    token: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    const driver = await this.findOne(payload.tenantId, payload.driverId);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });
    const resolvedCountryCode = countryCode ?? guarantor?.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when neither the guarantor nor the driver has a nationality set.',
      );
    }

    return this.intelligenceClient.initializeLivenessSession({
      tenantId: payload.tenantId,
      countryCode: resolvedCountryCode,
    });
  }

  async resolveGuarantorIdentityFromSelfService(
    token: string,
    dto: ResolveDriverIdentityDto,
  ) {
    const payload = await this.verifyGuarantorSelfServiceToken(token);
    return this.resolveGuarantorIdentity(payload.tenantId, payload.driverId, dto);
  }

  async listDocuments(tenantId: string, id: string): Promise<DriverDocumentRecord[]> {
    const driver = await this.findOne(tenantId, id);
    await this.syncExpiredDocuments(tenantId, [driver.id]);
    return this.driverDocuments.findMany({
      where: { tenantId: driver.tenantId, driverId: driver.id },
      orderBy: { createdAt: 'desc' },
    }) as Promise<DriverDocumentRecord[]>;
  }

  async getIdentitySummary(tenantId: string, id: string) {
    const driver = await this.findOne(tenantId, id);
    return {
      driverId: driver.id,
      identityStatus: driver.identityStatus,
      globalRiskScore: driver.globalRiskScore ?? null,
      riskBand: driver.riskBand ?? null,
      isWatchlisted: driver.isWatchlisted ?? null,
      duplicateIdentityFlag: driver.duplicateIdentityFlag ?? null,
      verificationProvider: driver.verificationProvider ?? null,
      verificationStatus: driver.verificationStatus ?? null,
      verificationCountryCode: driver.verificationCountryCode ?? null,
      verificationConfidence: driver.identityVerificationConfidence ?? null,
      verifiedIdentityExists: Boolean(driver.personId),
      summary: this.getIdentitySummaryMessage(driver),
    };
  }

  async getDocumentContent(
    tenantId: string,
    driverId: string,
    documentId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const driver = await this.findOne(tenantId, driverId);
    const document = await this.driverDocuments.findUnique({ where: { id: documentId } });

    if (!document || document.driverId !== driver.id || document.tenantId !== driver.tenantId) {
      throw new NotFoundException(`Driver document '${documentId}' not found`);
    }

    if (document.storageKey) {
      return {
        buffer: await this.documentStorageService.readFile(document.storageKey),
        contentType: document.contentType,
        fileName: document.fileName,
      };
    }

    if (document.fileDataUrl) {
      const parsed = this.decodeLegacyDataUrl(document.fileDataUrl);
      return {
        buffer: parsed.buffer,
        contentType: document.contentType,
        fileName: document.fileName,
      };
    }

    throw new NotFoundException('Document content is not available.');
  }

  async uploadDocument(
    tenantId: string,
    id: string,
    dto: CreateDriverDocumentDto,
  ): Promise<DriverDocumentRecord> {
    const driver = await this.findOne(tenantId, id);
    const fileBuffer = this.decodeIncomingDocument(dto);
    this.validateDocumentUpload(fileBuffer, dto.contentType);
    const storedFile = await this.documentStorageService.uploadFile(
      fileBuffer,
      dto.fileName,
      this.normalizeDocumentContentType(dto.contentType),
    );
    return this.driverDocuments.create({
      data: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        documentType: dto.documentType,
        fileName: dto.fileName,
        contentType: this.normalizeDocumentContentType(dto.contentType),
        fileDataUrl: null,
        storageKey: storedFile.storageKey,
        storageUrl: storedFile.storageUrl,
        uploadedBy: dto.uploadedBy,
        status: 'pending',
        expiresAt: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  async reviewDocument(
    tenantId: string,
    driverId: string,
    documentId: string,
    input: { status: 'approved' | 'rejected'; expiresAt?: string },
    reviewedBy: string,
  ): Promise<DriverDocumentRecord> {
    const driver = await this.findOne(tenantId, driverId);
    await this.syncExpiredDocuments(tenantId, [driver.id]);

    const document = await this.driverDocuments.findUnique({
      where: { id: documentId },
    });

    if (!document || document.driverId !== driver.id || document.tenantId !== driver.tenantId) {
      throw new NotFoundException(`Driver document '${documentId}' not found`);
    }

    if (input.status === 'approved') {
      const documentConfig = getDocumentType(document.documentType);
      let parsedExpiry: Date | null = null;

      if (input.expiresAt) {
        parsedExpiry = new Date(input.expiresAt);
        if (Number.isNaN(parsedExpiry.getTime())) {
          throw new BadRequestException('Expiry date must be a valid calendar date.');
        }
      }

      if (documentConfig.hasExpiry && !parsedExpiry) {
        throw new BadRequestException(
          'An expiry date is required before this document can be approved.',
        );
      }

      if (parsedExpiry && parsedExpiry.getTime() <= Date.now()) {
        throw new BadRequestException(
          'Expiry date must be in the future before this document can be approved.',
        );
      }

      return this.driverDocuments.update({
        where: { id: document.id },
        data: {
          status: 'approved',
          expiresAt: parsedExpiry,
          reviewedBy,
          reviewedAt: new Date(),
        },
      });
    }

    return this.driverDocuments.update({
      where: { id: document.id },
      data: {
        status: 'rejected',
        expiresAt: null,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async hasApprovedLicence(tenantId: string, driverId: string): Promise<boolean> {
    const driver = await this.findOne(tenantId, driverId);
    await this.syncExpiredDocuments(tenantId, [driver.id]);

    const approvedLicence = await this.driverDocuments.findFirst({
      where: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        documentType: DRIVER_LICENCE_DOCUMENT_TYPE,
        status: 'approved',
      },
    });

    return Boolean(approvedLicence);
  }

  async getGuarantor(tenantId: string, id: string): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    return guarantor;
  }

  async createOrUpdateGuarantor(
    tenantId: string,
    id: string,
    dto: CreateOrUpdateDriverGuarantorDto,
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const normalizedPhone = this.normalizePhoneNumber(
      dto.phone,
      dto.countryCode?.trim().toUpperCase() || null,
    );

    return this.driverGuarantors.upsert({
      where: { driverId: driver.id },
      create: {
        tenantId: driver.tenantId,
        driverId: driver.id,
        personId: null,
        name: dto.name.trim(),
        phone: normalizedPhone,
        countryCode: dto.countryCode?.trim().toUpperCase() || null,
        relationship: dto.relationship?.trim() || null,
        status: 'active',
        disconnectedAt: null,
        disconnectedReason: null,
      },
      update: {
        name: dto.name.trim(),
        phone: normalizedPhone,
        countryCode: dto.countryCode?.trim().toUpperCase() || null,
        relationship: dto.relationship?.trim() || null,
        status: 'active',
        disconnectedAt: null,
        disconnectedReason: null,
      },
    });
  }

  async removeGuarantor(
    tenantId: string,
    id: string,
    reason?: string | null,
  ): Promise<DriverGuarantorRecord> {
    const driver = await this.findOne(tenantId, id);
    const guarantor = await this.driverGuarantors.findUnique({
      where: { driverId: driver.id },
    });

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    return this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        status: 'disconnected',
        disconnectedAt: new Date(),
        disconnectedReason: reason?.trim() || 'Disconnected by operator request',
      },
    });
  }

  /**
   * Resolves the identity of a driver's guarantor and links them to the canonical
   * person graph. Two conflict checks are applied before enrollment:
   *
   * 1. Self-guarantee: the guarantor cannot be the same canonical person as the
   *    driver (detected via matching phone or email identifiers).
   * 2. Cross-role: if the guarantor's resolved personId matches an existing driver
   *    at this tenant, the intelligence plane emits a cross_role_presence risk
   *    signal automatically when recording the 'guarantor' role presence.
   */
  async resolveGuarantorIdentity(
    tenantId: string,
    driverId: string,
    dto: ResolveDriverIdentityDto,
  ): Promise<DriverIdentityResolutionResult & { crossRoleConflict?: boolean }> {
    const [driver, guarantor] = await Promise.all([
      this.findOne(tenantId, driverId),
      this.driverGuarantors.findUnique({ where: { driverId } }),
    ]);

    if (!guarantor) {
      throw new NotFoundException('No guarantor has been linked to this driver yet.');
    }

    const resolvedCountryCode = dto.countryCode ?? guarantor.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when neither the guarantor nor the driver has a nationality set.',
      );
    }

    const identifiers = [...(dto.identifiers ?? []), { type: 'PHONE', value: guarantor.phone }];

    // Pre-flight: if the guarantor's phone matches the driver's, block immediately.
    if (guarantor.phone === driver.phone) {
      throw new ConflictException(
        'A driver cannot be their own guarantor. The guarantor phone matches the driver.',
      );
    }

    const result = await this.intelligenceClient.resolveEnrollment({
      tenantId,
      countryCode: resolvedCountryCode,
      roleType: 'guarantor',
      ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
      identifiers,
      ...(dto.biometric ? { biometric: dto.biometric } : {}),
      providerVerification: {
        subjectConsent: dto.subjectConsent ?? false,
        validationData: {
          firstName: guarantor.name.split(' ')[0] ?? guarantor.name,
          ...(guarantor.name.split(' ').slice(1).join(' ')
            ? { lastName: guarantor.name.split(' ').slice(1).join(' ') }
            : {}),
        },
        ...(dto.selfieImageBase64 ? { selfieImageBase64: dto.selfieImageBase64 } : {}),
        ...(dto.livenessCheck ? { livenessCheck: dto.livenessCheck } : {}),
      },
    });

    // Post-resolution self-guarantee check: if the resolved canonical person
    // is the same as the driver's, the guarantor is the driver themselves.
    if (result.personId && result.personId === driver.personId) {
      throw new ConflictException(
        'A driver cannot be their own guarantor. The guarantor resolved to the same canonical person.',
      );
    }

    await this.driverGuarantors.update({
      where: { driverId: driver.id },
      data: {
        ...(result.personId ? { personId: result.personId } : {}),
      },
    });

    return result;
  }

  async listDocumentsFromSelfService(token: string) {
    const payload = await this.verifySelfServiceToken(token);
    return this.listDocuments(payload.tenantId, payload.driverId);
  }

  async uploadDocumentFromSelfService(token: string, dto: CreateDriverDocumentDto) {
    const payload = await this.verifySelfServiceToken(token);
    return this.uploadDocument(payload.tenantId, payload.driverId, dto);
  }

  async getDocumentContentFromSelfService(
    token: string,
    documentId: string,
  ): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const payload = await this.verifySelfServiceToken(token);
    return this.getDocumentContent(payload.tenantId, payload.driverId, documentId);
  }

  async initializeIdentityLivenessSessionFromSelfService(
    token: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const payload = await this.verifySelfServiceToken(token);
    return this.initializeIdentityLivenessSession(payload.tenantId, payload.driverId, countryCode);
  }

  async resolveIdentityFromSelfService(token: string, dto: ResolveDriverIdentityDto) {
    const payload = await this.verifySelfServiceToken(token);
    return this.resolveIdentity(payload.tenantId, payload.driverId, dto);
  }

  private async enrichDriversWithRisk(
    drivers: DriverWithIdentityState[],
  ): Promise<Array<DriverWithIdentityState & DriverIntelligenceSummary>> {
    const resolvedDrivers = drivers.filter((d) => d.personId);
    const riskResults = await Promise.allSettled(
      resolvedDrivers.map((d) => this.intelligenceClient.queryPersonRisk(d.personId as string)),
    );

    const riskByPersonId = new Map<string, DriverIntelligenceSummary>();
    for (let i = 0; i < resolvedDrivers.length; i++) {
      const result = riskResults[i];
      const resolvedDriver = resolvedDrivers[i];
      if (!resolvedDriver || result?.status !== 'fulfilled') {
        continue;
      }

      riskByPersonId.set(resolvedDriver.personId as string, {
        globalRiskScore: result.value.globalRiskScore,
        riskBand: result.value.riskBand,
        isWatchlisted: result.value.isWatchlisted,
        duplicateIdentityFlag: result.value.hasDuplicateIdentityFlag,
        verificationConfidence: result.value.verificationConfidence,
        verificationStatus: result.value.verificationStatus,
        verificationProvider: result.value.verificationProvider,
        verificationCountryCode: result.value.verificationCountryCode,
      });
    }

    return drivers.map((driver) => {
      if (!driver.personId) return driver;
      const risk = riskByPersonId.get(driver.personId);
      return risk ? { ...driver, ...risk } : driver;
    });
  }

  private async enrichDriverWithRisk(
    driver: DriverWithIdentityState,
  ): Promise<DriverWithIdentityState & DriverIntelligenceSummary> {
    if (!driver.personId) {
      return driver;
    }

    try {
      const risk = await this.intelligenceClient.queryPersonRisk(driver.personId);
      return {
        ...driver,
        globalRiskScore: risk.globalRiskScore,
        riskBand: risk.riskBand,
        isWatchlisted: risk.isWatchlisted,
        duplicateIdentityFlag: risk.hasDuplicateIdentityFlag,
        verificationConfidence: risk.verificationConfidence,
        verificationStatus: risk.verificationStatus,
        verificationProvider: risk.verificationProvider,
        verificationCountryCode: risk.verificationCountryCode,
      };
    } catch {
      return driver;
    }
  }

  private withDefaultGuarantorSummary<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(driver: TDriver): TDriver & DriverGuarantorSummary {
    return {
      ...driver,
      hasGuarantor: false,
      guarantorStatus: null,
      guarantorDisconnectedAt: null,
      guarantorPersonId: null,
      guarantorRiskBand: null,
      guarantorIsWatchlisted: null,
      guarantorIsAlsoDriver: false,
    };
  }

  private withDefaultDocumentSummary<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(driver: TDriver): TDriver & DriverDocumentSummary {
    return {
      ...driver,
      hasApprovedLicence: false,
      pendingDocumentCount: 0,
      rejectedDocumentCount: 0,
      expiredDocumentCount: 0,
    };
  }

  private withDefaultMobileAccessSummary<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(driver: TDriver): TDriver & DriverMobileAccessSummary {
    return {
      ...driver,
      hasMobileAccess: false,
      mobileAccessStatus: 'missing',
    };
  }

  private async attachGuarantorSummariesSafely<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverGuarantorSummary>> {
    try {
      return await this.attachGuarantorSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver guarantor enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultGuarantorSummary(driver));
    }
  }

  private async attachDocumentSummariesSafely<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverDocumentSummary>> {
    try {
      return await this.attachDocumentSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver document enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultDocumentSummary(driver));
    }
  }

  private async attachMobileAccessSummariesSafely<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverMobileAccessSummary>> {
    try {
      return await this.attachMobileAccessSummaries(tenantId, drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(
        `Driver mobile-access enrichment failed for tenant '${tenantId}': ${this.getErrorMessage(error)}`,
      );
      return drivers.map((driver) => this.withDefaultMobileAccessSummary(driver));
    }
  }

  private async attachReadinessSummariesSafely<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary,
  >(drivers: TDriver[]): Promise<Array<TDriver & DriverReadinessSummary>> {
    try {
      return await this.attachReadinessSummaries(drivers);
    } catch (error) {
      if (!this.isRecoverableDriverEnrichmentError(error)) {
        throw error;
      }
      this.logger.warn(`Driver readiness enrichment failed: ${this.getErrorMessage(error)}`);
      return drivers.map((driver) => ({
        ...driver,
        activationReadiness: 'not_ready',
        activationReadinessReasons: [],
        assignmentReadiness: 'not_ready',
        assignmentReadinessReasons: [],
      }));
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }

  private isRecoverableDriverEnrichmentError(error: unknown): boolean {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return error.code === 'P2021' || error.code === 'P2022';
    }

    const message = this.getErrorMessage(error).toLowerCase();
    return (
      (message.includes('relation') && message.includes('does not exist')) ||
      (message.includes('column') && message.includes('does not exist')) ||
      message.includes('unknown column')
    );
  }

  async create(tenantId: string, dto: CreateDriverDto): Promise<Driver> {
    const fleet = await this.prisma.fleet.findUnique({
      where: { id: dto.fleetId },
      include: { operatingUnit: { select: { id: true, businessEntityId: true } } },
    });

    if (!fleet) {
      throw new NotFoundException(`Fleet '${dto.fleetId}' not found`);
    }

    assertTenantOwnership(asTenantId(fleet.tenantId), asTenantId(tenantId));

    if (fleet.status !== 'active') {
      throw new BadRequestException(
        `Cannot enroll a driver into fleet '${dto.fleetId}' with status '${fleet.status}'`,
      );
    }

    const normalizedPhone = this.normalizePhoneNumber(dto.phone, dto.nationality ?? null);

    // Phone uniqueness per tenant is enforced by @@unique in the schema,
    // but surface a friendly error before hitting the DB constraint.
    const existing = await this.prisma.driver.findUnique({
      where: { tenantId_phone: { tenantId, phone: normalizedPhone } },
    });

    if (existing) {
      throw new ConflictException(
        `A driver with phone '${normalizedPhone}' already exists in this tenant`,
      );
    }

    return this.prisma.driver.create({
      data: {
        tenantId,
        fleetId: dto.fleetId,
        operatingUnitId: fleet.operatingUnit.id,
        businessEntityId: fleet.operatingUnit.businessEntityId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: normalizedPhone,
        email: dto.email ?? null,
        dateOfBirth: dto.dateOfBirth ?? null,
        nationality: dto.nationality ?? null,
        status: 'inactive', // drivers start inactive until onboarding completes
        identityStatus: 'unverified',
      } as never,
    });
  }

  async updateStatus(tenantId: string, id: string, newStatus: string): Promise<Driver> {
    const driver = await this.findOne(tenantId, id);

    const statusKey = newStatus as keyof typeof DRIVER_STATUS_CODES;
    const statusConfig = DRIVER_STATUS_CODES[statusKey];
    if (!statusConfig) {
      const valid = Object.keys(DRIVER_STATUS_CODES).join(', ');
      throw new BadRequestException(`Invalid driver status '${newStatus}'. Valid values: ${valid}`);
    }

    const currentConfig = DRIVER_STATUS_CODES[driver.status as keyof typeof DRIVER_STATUS_CODES];
    if (currentConfig?.terminal) {
      throw new BadRequestException(
        `Driver '${id}' is in terminal status '${driver.status}' and cannot be transitioned`,
      );
    }

    if (newStatus === 'active') {
      if (driver.activationReadiness !== 'ready') {
        throw new BadRequestException(
          driver.activationReadinessReasons[0] ?? 'This driver is not ready for activation yet.',
        );
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async initializeIdentityLivenessSession(
    tenantId: string,
    id: string,
    countryCode?: string,
  ): Promise<{
    providerName: string;
    sessionId: string;
    expiresAt?: string;
    fallbackChain: string[];
  }> {
    const driver = await this.findOne(tenantId, id);
    const resolvedCountryCode = countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when the driver nationality is not set',
      );
    }

    try {
      const session = await this.intelligenceClient.initializeLivenessSession({
        tenantId,
        countryCode: resolvedCountryCode,
      });

      await this.prisma.driver.update({
        where: { id: driver.id },
        data: {
          identityStatus: 'pending_verification',
        } as never,
      });

      return session;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw new ServiceUnavailableException(
          'Live verification is unavailable right now. Try again, or continue with manual verification only if your process allows it.',
        );
      }

      throw error;
    }
  }

  async resolveIdentity(
    tenantId: string,
    id: string,
    dto: ResolveDriverIdentityDto,
  ): Promise<{
    decision: string;
    personId?: string;
    reviewCaseId?: string;
    providerLookupStatus?: string;
    providerVerificationStatus?: string;
    providerName?: string;
    matchedIdentifierType?: string;
    isVerifiedMatch?: boolean;
    verifiedProfile?: {
      fullName?: string;
      dateOfBirth?: string;
      address?: string;
      gender?: string;
      photoUrl?: string;
    };
    globalRiskScore?: number;
    riskBand?: string;
    isWatchlisted?: boolean;
    hasDuplicateIdentityFlag?: boolean;
    fraudIndicatorCount?: number;
    verificationConfidence?: number;
    livenessPassed?: boolean;
    livenessProviderName?: string;
    livenessConfidenceScore?: number;
    livenessReason?: string;
  }> {
    const driver = await this.findOne(tenantId, id);
    const resolvedCountryCode = dto.countryCode ?? driver.nationality;

    if (!resolvedCountryCode) {
      throw new BadRequestException(
        'countryCode is required when the driver nationality is not set',
      );
    }

    const identifiers = [
      ...(dto.identifiers ?? []),
      { type: 'PHONE', value: driver.phone },
      ...(driver.email ? [{ type: 'EMAIL', value: driver.email }] : []),
    ];

    const result: DriverIdentityResolutionResult = await this.intelligenceClient.resolveEnrollment({
      tenantId,
      countryCode: resolvedCountryCode,
      roleType: 'driver',
      ...(dto.livenessPassed !== undefined ? { livenessPassed: dto.livenessPassed } : {}),
      identifiers,
      ...(dto.biometric ? { biometric: dto.biometric } : {}),
      providerVerification: {
        subjectConsent: dto.subjectConsent ?? false,
        validationData: {
          firstName: driver.firstName,
          lastName: driver.lastName,
          ...(driver.dateOfBirth ? { dateOfBirth: driver.dateOfBirth } : {}),
        },
        ...(dto.selfieImageBase64 ? { selfieImageBase64: dto.selfieImageBase64 } : {}),
        ...(dto.livenessCheck ? { livenessCheck: dto.livenessCheck } : {}),
      },
    });

    const nextIdentityStatus = this.mapIdentityStatus(
      result.decision,
      result.isVerifiedMatch === true,
      result.providerLookupStatus,
    );

    // Canonical enrichment (verified name, DOB, etc.) is stored on intel_persons
    // by the intelligence plane — see person-graph.md Principle 4. Only operational
    // identity state and the cross-plane personId FK are written back here.
    await this.prisma.driver.update({
      where: { id: driver.id },
      data: {
        ...(result.personId ? { personId: result.personId } : {}),
        identityStatus: nextIdentityStatus,
        identityReviewCaseId: result.reviewCaseId ?? null,
        identityReviewStatus: result.reviewCaseId ? 'open' : null,
        identityLastDecision:
          result.providerVerificationStatus ?? result.providerLookupStatus ?? result.decision,
        identityVerificationConfidence: result.verificationConfidence ?? null,
        identityLastVerifiedAt: new Date(),
        identityLivenessPassed: result.livenessPassed ?? null,
        identityLivenessProvider: result.livenessProviderName ?? null,
        identityLivenessConfidence: result.livenessConfidenceScore ?? null,
        identityLivenessReason: result.livenessReason ?? null,
      } as never,
    });

    return result;
  }

  private mapIdentityStatus(
    decision: string,
    isVerifiedMatch: boolean,
    providerLookupStatus?: string,
  ): string {
    if (decision === 'review_required') {
      return 'review_needed';
    }

    if (isVerifiedMatch) {
      return 'verified';
    }

    if (providerLookupStatus === 'no_match') {
      return 'failed';
    }

    if (decision === 'rejected') {
      return 'failed';
    }

    return 'pending_verification';
  }

  private normalizePhoneNumber(phone: string, countryCode?: string | null): string {
    const sanitized = phone.trim().replace(/[^\d+]/g, '');

    if (!countryCode) {
      if (/^\+\d{10,15}$/.test(sanitized)) {
        return sanitized;
      }

      throw new BadRequestException(
        'Phone numbers without an explicit country must be entered in full international format, for example +2348012345678.',
      );
    }

    const normalizedCountryCode = countryCode.toUpperCase();
    if (!isCountrySupported(normalizedCountryCode)) {
      throw new BadRequestException(
        `Country '${normalizedCountryCode}' is not supported for phone normalization.`,
      );
    }

    const normalized = normalizePhoneNumberForCountry(phone, normalizedCountryCode);

    if (/^\+\d{10,15}$/.test(normalized)) {
      return normalized;
    }

    throw new BadRequestException(
      `Phone number '${phone}' is not in a supported format for country '${normalizedCountryCode}'.`,
    );
  }

  private decodeIncomingDocument(dto: CreateDriverDocumentDto): Buffer {
    if (dto.fileBase64?.trim()) {
      return Buffer.from(dto.fileBase64.trim(), 'base64');
    }

    throw new BadRequestException('Document content is required.');
  }

  private validateDocumentUpload(buffer: Buffer, contentType: string): void {
    const normalizedContentType = this.normalizeDocumentContentType(contentType);
    const maxFileBytes =
      Number(process.env.DOCUMENT_STORAGE_MAX_FILE_BYTES) || MAX_DOCUMENT_FILE_BYTES_FALLBACK;

    if (buffer.byteLength === 0) {
      throw new BadRequestException('Document content is required.');
    }

    if (buffer.byteLength > maxFileBytes) {
      throw new BadRequestException(
        `Document files must be ${Math.floor(maxFileBytes / (1024 * 1024))} MB or smaller.`,
      );
    }

    if (!ALLOWED_DRIVER_DOCUMENT_CONTENT_TYPES.has(normalizedContentType)) {
      throw new BadRequestException('Only PDF, JPEG, PNG, and WEBP document uploads are allowed.');
    }

    if (!this.bufferMatchesDeclaredContentType(buffer, normalizedContentType)) {
      throw new BadRequestException('Uploaded document content does not match the declared file type.');
    }
  }

  private normalizeDocumentContentType(contentType: string): string {
    return contentType.split(';', 1)[0]?.trim().toLowerCase() ?? 'application/octet-stream';
  }

  private bufferMatchesDeclaredContentType(buffer: Buffer, contentType: string): boolean {
    if (contentType === 'application/pdf') {
      return buffer.subarray(0, 5).toString('utf8') === '%PDF-';
    }

    if (contentType === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (contentType === 'image/png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    }

    if (contentType === 'image/webp') {
      return (
        buffer.subarray(0, 4).toString('utf8') === 'RIFF' &&
        buffer.subarray(8, 12).toString('utf8') === 'WEBP'
      );
    }

    return false;
  }

  private decodeLegacyDataUrl(fileDataUrl: string): { buffer: Buffer } {
    const match = fileDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match?.[2]) {
      throw new BadRequestException('Document payload must be a valid base64 data URL.');
    }
    return { buffer: Buffer.from(match[2], 'base64') };
  }

  private getIdentitySummaryMessage(driver: {
    identityStatus: string;
    personId?: string | null;
    isWatchlisted?: boolean | undefined;
    duplicateIdentityFlag?: boolean | undefined;
  }): string {
    if (driver.identityStatus === 'verified') {
      if (driver.isWatchlisted) {
        return 'Verified identity exists. Watchlist review is active.';
      }
      if (driver.duplicateIdentityFlag) {
        return 'Verified identity exists. Duplicate-identity review is active.';
      }
      return 'Verified identity exists in the intelligence plane.';
    }

    if (driver.identityStatus === 'review_needed') {
      return 'Identity review is required before this record is considered verified.';
    }

    if (driver.identityStatus === 'pending_verification') {
      return 'Identity verification is in progress.';
    }

    if (driver.identityStatus === 'failed') {
      return 'Identity verification did not complete successfully.';
    }

    return 'Identity verification has not started yet.';
  }

  private computeReadiness(driver: {
    identityStatus: string;
    guarantorStatus?: string | null;
    guarantorPersonId?: string | null;
    hasApprovedLicence: boolean;
    hasMobileAccess: boolean;
  }): DriverReadinessSummary {
    const reasons: string[] = [];

    if (driver.identityStatus !== 'verified') {
      reasons.push('Identity verification must be completed.');
    }

    if (driver.guarantorStatus !== 'active' || !driver.guarantorPersonId) {
      reasons.push('A guarantor with verified linkage is required.');
    }

    if (!driver.hasApprovedLicence) {
      reasons.push('An approved driver licence is required.');
    }

    if (!driver.hasMobileAccess) {
      reasons.push('Mobile access must be linked before operations begin.');
    }

    const readiness =
      reasons.length === 0 ? 'ready' : reasons.length <= 2 ? 'partially_ready' : 'not_ready';

    return {
      activationReadiness: readiness,
      activationReadinessReasons: reasons,
      assignmentReadiness: readiness,
      assignmentReadinessReasons: reasons,
    };
  }

  private async attachGuarantorSummaries<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverGuarantorSummary>> {
    if (drivers.length === 0) return [];

    const guarantors =
      (await this.driverGuarantors.findMany({
        where: {
          tenantId,
          driverId: { in: drivers.map((driver) => driver.id) },
        },
      })) ?? [];

    const guarantorsByDriverId = new Map(
      guarantors.map((guarantor) => [guarantor.driverId, guarantor]),
    );

    // Fetch risk signals and role presence for guarantors whose identity
    // has been resolved. Uses Promise.allSettled so a failed intelligence
    // call for one guarantor does not block the rest of the driver list.
    const resolvedGuarantors = guarantors.filter((g) => g.personId);
    const [riskResults, roleResults] = await Promise.all([
      Promise.allSettled(
        resolvedGuarantors.map((g) =>
          this.intelligenceClient.queryPersonRisk(g.personId as string),
        ),
      ),
      Promise.allSettled(
        resolvedGuarantors.map((g) =>
          this.intelligenceClient.queryPersonRolePresence(g.personId as string),
        ),
      ),
    ]);

    const guarantorRiskByPersonId = new Map<
      string,
      { riskBand?: string; isWatchlisted?: boolean }
    >();
    const guarantorRoleByPersonId = new Map<string, { isDriver: boolean }>();

    for (let i = 0; i < resolvedGuarantors.length; i++) {
      const g = resolvedGuarantors[i];
      if (!g) continue;
      const riskResult = riskResults[i];
      const roleResult = roleResults[i];
      if (riskResult?.status === 'fulfilled') {
        guarantorRiskByPersonId.set(g.personId as string, {
          ...(riskResult.value.riskBand ? { riskBand: riskResult.value.riskBand } : {}),
          ...(typeof riskResult.value.isWatchlisted === 'boolean'
            ? { isWatchlisted: riskResult.value.isWatchlisted }
            : {}),
        });
      }
      if (roleResult?.status === 'fulfilled') {
        guarantorRoleByPersonId.set(g.personId as string, {
          isDriver: roleResult.value.isDriver,
        });
      }
    }

    return drivers.map((driver) => {
      const guarantor = guarantorsByDriverId.get(driver.id);
      const personId = guarantor?.personId ?? null;
      const risk = personId ? guarantorRiskByPersonId.get(personId) : undefined;
      const role = personId ? guarantorRoleByPersonId.get(personId) : undefined;

      return {
        ...driver,
        hasGuarantor: guarantor?.status === 'active',
        guarantorStatus: guarantor?.status ?? null,
        guarantorDisconnectedAt: guarantor?.disconnectedAt ?? null,
        guarantorPersonId: personId,
        guarantorRiskBand: risk?.riskBand ?? null,
        guarantorIsWatchlisted: risk?.isWatchlisted ?? null,
        guarantorIsAlsoDriver: role?.isDriver ?? false,
      };
    });
  }

  private async syncExpiredDocuments(tenantId: string, driverIds?: string[]): Promise<void> {
    await this.driverDocuments.updateMany({
      where: {
        tenantId,
        status: 'approved',
        expiresAt: { lt: new Date() },
        ...(driverIds && driverIds.length > 0 ? { driverId: { in: driverIds } } : {}),
      },
      data: { status: 'expired' },
    });
  }

  private async attachDocumentSummaries<
    TDriver extends DriverWithIdentityState & DriverIntelligenceSummary & DriverGuarantorSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverDocumentSummary>> {
    if (drivers.length === 0) return [];

    const driverIds = drivers.map((driver) => driver.id);
    await this.syncExpiredDocuments(tenantId, driverIds);

    const documents = await this.driverDocuments.findMany({
      where: {
        tenantId,
        driverId: { in: driverIds },
      },
      select: {
        driverId: true,
        documentType: true,
        status: true,
      },
    });

    const summaries = new Map<string, DriverDocumentSummary>();
    for (const driver of drivers) {
      summaries.set(driver.id, {
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
      });
    }

    for (const document of documents) {
      const summary = summaries.get(document.driverId);
      if (!summary) continue;

      if (
        document.documentType === DRIVER_LICENCE_DOCUMENT_TYPE &&
        document.status === 'approved'
      ) {
        summary.hasApprovedLicence = true;
      }

      if (document.status === 'pending') {
        summary.pendingDocumentCount += 1;
      }
      if (document.status === 'rejected') {
        summary.rejectedDocumentCount += 1;
      }
      if (document.status === 'expired') {
        summary.expiredDocumentCount += 1;
      }
    }

    return drivers.map((driver) => ({
      ...driver,
      ...(summaries.get(driver.id) ?? {
        hasApprovedLicence: false,
        pendingDocumentCount: 0,
        rejectedDocumentCount: 0,
        expiredDocumentCount: 0,
      }),
    }));
  }

  private async attachMobileAccessSummaries<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary,
  >(tenantId: string, drivers: TDriver[]): Promise<Array<TDriver & DriverMobileAccessSummary>> {
    if (drivers.length === 0) return [];

    const linkedUsers = await this.prisma.user.findMany({
      where: {
        tenantId,
        driverId: { in: drivers.map((driver) => driver.id) },
      },
      select: {
        driverId: true,
        isActive: true,
        mobileAccessRevoked: true,
      },
    });

    const mobileAccessByDriverId = new Map<
      string,
      { hasMobileAccess: boolean; mobileAccessStatus: 'linked' | 'inactive' }
    >();

    for (const user of linkedUsers) {
      if (!user.driverId) continue;
      mobileAccessByDriverId.set(user.driverId, {
        hasMobileAccess: user.isActive && !user.mobileAccessRevoked,
        mobileAccessStatus: user.isActive && !user.mobileAccessRevoked ? 'linked' : 'inactive',
      });
    }

    return drivers.map((driver) => {
      const summary = mobileAccessByDriverId.get(driver.id);
      return {
        ...driver,
        hasMobileAccess: summary?.hasMobileAccess ?? false,
        mobileAccessStatus: summary?.mobileAccessStatus ?? 'missing',
      };
    });
  }

  private async attachReadinessSummaries<
    TDriver extends DriverWithIdentityState &
      DriverIntelligenceSummary &
      DriverGuarantorSummary &
      DriverDocumentSummary &
      DriverMobileAccessSummary,
  >(drivers: TDriver[]): Promise<Array<TDriver & DriverReadinessSummary>> {
    return drivers.map((driver) => ({
      ...driver,
      ...this.computeReadiness(driver),
    }));
  }

  private async createSelfServiceToken(tenantId: string, driverId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        purpose: this.selfServicePurpose,
        tenantId,
        driverId,
      },
      { expiresIn: '48h' },
    );
  }

  private readonly guarantorSelfServicePurpose = 'guarantor_self_service';

  private async createGuarantorSelfServiceToken(
    tenantId: string,
    driverId: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      {
        purpose: this.guarantorSelfServicePurpose,
        tenantId,
        driverId,
      },
      { expiresIn: '48h' },
    );
  }

  private async verifyGuarantorSelfServiceToken(
    token: string,
  ): Promise<{ tenantId: string; driverId: string }> {
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as {
        purpose?: string;
        tenantId?: string;
        driverId?: string;
      };

      if (
        payload.purpose !== this.guarantorSelfServicePurpose ||
        !payload.tenantId ||
        !payload.driverId
      ) {
        throw new UnauthorizedException('The guarantor verification link is invalid.');
      }

      return { tenantId: payload.tenantId, driverId: payload.driverId };
    } catch {
      throw new UnauthorizedException(
        'The guarantor verification link is invalid or expired.',
      );
    }
  }

  private generateOtpCode(): string {
    // Unambiguous uppercase alphanumeric — excludes 0/O, 1/I
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  private async createAndStoreSelfServiceOtp(
    tenantId: string,
    subjectType: 'driver' | 'guarantor',
    subjectId: string,
  ): Promise<string> {
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

    // Retry up to 5 times on collision (theoretical only with 6 chars / 1B possibilities)
    for (let attempt = 0; attempt < 5; attempt++) {
      const otpCode = this.generateOtpCode();
      try {
        await this.prisma.selfServiceOtp.create({
          data: { tenantId, subjectType, subjectId, otpCode, expiresAt },
        });
        return otpCode;
      } catch {
        // Unique constraint violation — retry with a new code
        if (attempt === 4) throw new Error('Failed to generate a unique OTP after 5 attempts');
      }
    }

    throw new Error('OTP generation failed');
  }

  private async verifySelfServiceToken(
    token: string,
  ): Promise<{ tenantId: string; driverId: string }> {
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as {
        purpose?: string;
        tenantId?: string;
        driverId?: string;
      };

      if (payload.purpose !== this.selfServicePurpose || !payload.tenantId || !payload.driverId) {
        throw new UnauthorizedException('The self-service verification link is invalid.');
      }

      return {
        tenantId: payload.tenantId,
        driverId: payload.driverId,
      };
    } catch {
      throw new UnauthorizedException('The self-service verification link is invalid or expired.');
    }
  }
}
