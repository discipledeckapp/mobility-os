import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import path from 'node:path';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';
import {
  isPlaceholderCredential,
  requestProviderJson,
  summarizeProviderFailure,
} from './provider-http';

export interface VerificationIdentifierInput {
  type: string;
  value: string;
  countryCode?: string;
}

export interface IdentityVerificationResult {
  status: 'verified' | 'no_match' | 'provider_unavailable' | 'provider_error' | 'skipped';
  providerName: string;
  verificationStatus?: string;
  matchedIdentifierType?: string;
  documentMetadata?: {
    validity?: 'valid' | 'invalid' | 'unknown';
    issueDate?: string;
    expiryDate?: string;
    portraitAvailable?: boolean;
    stateOfIssuance?: string;
    licenceClass?: string;
  };
  enrichment?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    fullAddress?: string;
    addressLine?: string;
    town?: string;
    localGovernmentArea?: string;
    state?: string;
    mobileNumber?: string;
    emailAddress?: string;
    birthState?: string;
    birthLga?: string;
    nextOfKinState?: string;
    religion?: string;
    ninIdNumber?: string;
    gender?: string;
    photoUrl?: string;
    signatureUrl?: string;
  };
  auditData?: Record<string, unknown>;
  reason?: string;
}

export interface IdentityProviderAdapter {
  readonly name: string;
  canVerify(identifiers: VerificationIdentifierInput[]): boolean;
  verify(
    identifiers: VerificationIdentifierInput[],
    providerVerification?: {
      subjectConsent?: boolean;
      validationData?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
      };
      selfieImageBase64?: string;
      selfieImageUrl?: string;
    },
  ): Promise<IdentityVerificationResult>;
}

// YouVerify-specific path segments per identifier type (provider API contract, not country logic)
// See: https://app.youverify.co/user/dashboard/documentation
const YOUVERIFY_IDENTIFIER_PATH: Record<string, string> = {
  NATIONAL_ID: 'nin',
  BANK_ID: 'bvn',
  PASSPORT: 'international-passport',
  DRIVERS_LICENSE: 'drivers-license',
  VOTERS_CARD: 'voter-card',
};

function firstIdentifier(
  identifiers: VerificationIdentifierInput[],
): VerificationIdentifierInput | undefined {
  return identifiers[0];
}

function optionalStringProperty(
  key: string,
  value: unknown,
): Record<string, string> | Record<string, never> {
  return typeof value === 'string' ? { [key]: value } : {};
}

function joinNameParts(parts: Array<unknown>): string | undefined {
  const filtered = parts
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
    .trim();
  return filtered.length > 0 ? filtered : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const SELFIE_FETCH_TIMEOUT_MS = 5_000;

function isPrivateIpv4(host: string): boolean {
  const octets = host.split('.').map((segment) => Number.parseInt(segment, 10));
  if (octets.length !== 4 || octets.some((value) => Number.isNaN(value))) {
    return false;
  }

  const first = octets[0];
  const second = octets[1];
  if (first === undefined || second === undefined) {
    return false;
  }

  if (first === 10 || first === 127 || first === 0) {
    return true;
  }
  if (first === 169 && second === 254) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  if (first === 192 && second === 168) {
    return true;
  }
  return false;
}

function isBlockedIpv6(host: string): boolean {
  const normalized = host.toLowerCase();
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd');
}

function isBlockedHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.internal') ||
    normalized.endsWith('.local')
  ) {
    return true;
  }

  const ipVersion = isIP(normalized);
  if (ipVersion === 4) {
    return isPrivateIpv4(normalized);
  }
  if (ipVersion === 6) {
    return isBlockedIpv6(normalized);
  }

  return false;
}

async function assertPublicSelfieUrl(imageUrl: string): Promise<URL> {
  const parsed = new URL(imageUrl);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('unsupported_protocol');
  }
  if (parsed.username || parsed.password) {
    throw new Error('embedded_credentials_not_allowed');
  }
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error('blocked_hostname');
  }

  const resolved = await lookup(parsed.hostname, { all: true });
  if (resolved.length === 0) {
    throw new Error('hostname_resolution_failed');
  }
  if (resolved.some((entry) => isBlockedHostname(entry.address))) {
    throw new Error('blocked_host_resolution');
  }

  return parsed;
}

function normalizeYouVerifyResponse(
  providerName: string,
  identifierType: string,
  payload: Record<string, unknown>,
): IdentityVerificationResult {
  const data = isRecord(payload.data) ? payload.data : {};
  const validations = isRecord(data.validations) ? data.validations : {};
  const validationData = isRecord(validations.data) ? validations.data : {};
  const selfieValidation = isRecord(validations.selfie) ? validations.selfie : {};
  const selfieVerification = isRecord(selfieValidation.selfieVerification)
    ? selfieValidation.selfieVerification
    : {};
  const status = typeof data.status === 'string' ? data.status.toLowerCase() : '';
  const verificationStatus =
    typeof payload.message === 'string'
      ? payload.message
      : typeof data.status === 'string'
        ? data.status
        : 'unverified';
  const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : '';
  const middleName = typeof data.middleName === 'string' ? data.middleName.trim() : '';
  const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : '';
  const addressLine =
    typeof data.addressLine === 'string'
      ? data.addressLine
      : typeof data.address_line === 'string'
        ? data.address_line
        : typeof data.residenceAddress === 'string'
          ? data.residenceAddress
          : undefined;
  const town =
    typeof data.town === 'string'
      ? data.town
      : typeof data.city === 'string'
        ? data.city
        : undefined;
  const localGovernmentArea =
    typeof data.lga === 'string'
      ? data.lga
      : typeof data.localGovernmentArea === 'string'
        ? data.localGovernmentArea
        : typeof data.local_government_area === 'string'
          ? data.local_government_area
          : undefined;
  const state =
    typeof data.state === 'string'
      ? data.state
      : typeof data.residenceState === 'string'
        ? data.residenceState
        : undefined;
  const fullAddress =
    typeof data.fullAddress === 'string'
      ? data.fullAddress
      : typeof data.address === 'string'
        ? data.address
        : joinNameParts([addressLine, town, localGovernmentArea, state]);
  const photoUrl =
    typeof data.image === 'string'
      ? data.image
      : typeof data.photo === 'string'
        ? data.photo
        : typeof data.photoUrl === 'string'
          ? data.photoUrl
          : undefined;
  const signatureUrl =
    typeof data.signature === 'string'
      ? data.signature
      : typeof data.signatureUrl === 'string'
        ? data.signatureUrl
        : undefined;
  const selfieConfidenceLevel =
    typeof selfieVerification.confidenceLevel === 'number'
      ? selfieVerification.confidenceLevel
      : undefined;
  const selfieMatch =
    typeof selfieVerification.match === 'boolean' ? selfieVerification.match : undefined;
  const selfieImage =
    typeof selfieVerification.image === 'string'
      ? selfieVerification.image
      : typeof selfieValidation.image === 'string'
        ? selfieValidation.image
        : undefined;
  const issueDate =
    typeof data.issueDate === 'string'
      ? data.issueDate
      : typeof data.issuedDate === 'string'
        ? data.issuedDate
        : undefined;
  const expiryDate =
    typeof data.expiryDate === 'string'
      ? data.expiryDate
      : typeof data.expirationDate === 'string'
        ? data.expirationDate
        : typeof data.expiredDate === 'string'
          ? data.expiredDate
          : undefined;
  const stateOfIssuance =
    typeof data.stateOfIssuance === 'string' ? data.stateOfIssuance : undefined;
  const licenceClass =
    typeof data.licenceClass === 'string'
      ? data.licenceClass
      : typeof data.licenseClass === 'string'
        ? data.licenseClass
        : typeof data.licenceType === 'string'
          ? data.licenceType
          : typeof data.licenseType === 'string'
            ? data.licenseType
            : typeof data.classOfVehicle === 'string'
              ? data.classOfVehicle
              : typeof data.vehicleClass === 'string'
                ? data.vehicleClass
                : undefined;
  const validationMessages =
    typeof validations.validationMessages === 'string' ? validations.validationMessages : undefined;
  const allValidationPassed =
    typeof data.allValidationPassed === 'boolean' ? data.allValidationPassed : undefined;
  const enrichment: NonNullable<IdentityVerificationResult['enrichment']> = {};

  if (firstName.length > 0) enrichment.firstName = firstName;
  if (middleName.length > 0) enrichment.middleName = middleName;
  if (lastName.length > 0) enrichment.lastName = lastName;
  const fullName = joinNameParts([firstName, middleName, lastName]);
  if (fullName) enrichment.fullName = fullName;
  if (typeof data.dateOfBirth === 'string') enrichment.dateOfBirth = data.dateOfBirth;
  if (typeof data.nationality === 'string') enrichment.nationality = data.nationality;
  if (fullAddress) {
    enrichment.address = fullAddress;
    enrichment.fullAddress = fullAddress;
  }
  if (addressLine) enrichment.addressLine = addressLine;
  if (town) enrichment.town = town;
  if (localGovernmentArea) enrichment.localGovernmentArea = localGovernmentArea;
  if (state) enrichment.state = state;
  if (typeof data.mobile === 'string') enrichment.mobileNumber = data.mobile;
  if (typeof data.mobileNumber === 'string') enrichment.mobileNumber = data.mobileNumber;
  if (typeof data.email === 'string') enrichment.emailAddress = data.email;
  if (typeof data.emailAddress === 'string') enrichment.emailAddress = data.emailAddress;
  if (typeof data.birthState === 'string') enrichment.birthState = data.birthState;
  if (typeof data.birthLGA === 'string') enrichment.birthLga = data.birthLGA;
  if (typeof data.birthLga === 'string') enrichment.birthLga = data.birthLga;
  if (typeof data.nokState === 'string') enrichment.nextOfKinState = data.nokState;
  if (typeof data.nextOfKinState === 'string') enrichment.nextOfKinState = data.nextOfKinState;
  if (typeof data.religion === 'string') enrichment.religion = data.religion;
  if (typeof data.nin === 'string') enrichment.ninIdNumber = data.nin;
  if (typeof data.ninIdNumber === 'string') enrichment.ninIdNumber = data.ninIdNumber;
  if (typeof data.idNumber === 'string') enrichment.ninIdNumber = data.idNumber;
  if (typeof data.gender === 'string') enrichment.gender = data.gender;
  const resolvedPhotoUrl = photoUrl ?? selfieImage;
  if (resolvedPhotoUrl) enrichment.photoUrl = resolvedPhotoUrl;
  if (signatureUrl) enrichment.signatureUrl = signatureUrl;
  const computedValidity =
    typeof data.isValid === 'boolean'
      ? data.isValid
        ? 'valid'
        : 'invalid'
      : typeof data.valid === 'boolean'
        ? data.valid
          ? 'valid'
          : 'invalid'
        : expiryDate
          ? new Date(expiryDate).getTime() < Date.now()
            ? 'invalid'
            : 'valid'
          : status === 'found'
            ? 'valid'
            : 'unknown';

  return {
    status: status === 'found' ? 'verified' : 'no_match',
    providerName,
    verificationStatus,
    matchedIdentifierType: identifierType,
    documentMetadata: {
      validity: computedValidity,
      ...optionalStringProperty('issueDate', issueDate),
      ...optionalStringProperty('expiryDate', expiryDate),
      ...optionalStringProperty('stateOfIssuance', stateOfIssuance),
      ...optionalStringProperty('licenceClass', licenceClass),
      portraitAvailable:
        typeof data.image === 'string'
          ? data.image.trim().length > 0
          : typeof selfieImage === 'string' && selfieImage.trim().length > 0,
    },
    ...(Object.keys(enrichment).length > 0 ? { enrichment } : {}),
    auditData: {
      identifierType,
      verificationStatus,
      providerReference: typeof data.id === 'string' ? data.id : null,
      documentType: typeof data.type === 'string' ? data.type : null,
      allValidationPassed,
      dataValidation: typeof data.dataValidation === 'boolean' ? data.dataValidation : null,
      selfieValidation: typeof data.selfieValidation === 'boolean' ? data.selfieValidation : null,
      validationMessages,
      stateOfIssuance,
      licenceClass,
      validations: {
        data: validationData,
        selfie: {
          match: selfieMatch ?? null,
          confidenceLevel: selfieConfidenceLevel ?? null,
          image: selfieImage ?? null,
        },
      },
      data,
    },
    ...(typeof data.reason === 'string' ? { reason: data.reason } : {}),
  };
}

type NigeriaMockIdentity = {
  fullName: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  photoUrl: string;
  verificationStatus: string;
  outcome?: 'verified' | 'face_mismatch';
};

function normalizeComparableValue(value?: string): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function doesLocalMockMatchValidation(
  mockIdentity: NigeriaMockIdentity,
  providerVerification?: {
    validationData?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
    };
  },
): boolean {
  const validation = providerVerification?.validationData;
  if (!validation) {
    return true;
  }

  const expectedFullName = normalizeComparableValue(
    [validation.firstName, validation.middleName, validation.lastName].filter(Boolean).join(' '),
  );
  const mockFullName = normalizeComparableValue(mockIdentity.fullName);
  const expectedDob = normalizeComparableValue(validation.dateOfBirth);
  const mockDob = normalizeComparableValue(mockIdentity.dateOfBirth);
  const expectedGender = normalizeComparableValue(validation.gender);
  const mockGender = normalizeComparableValue(mockIdentity.gender);

  if (expectedFullName && mockFullName && expectedFullName !== mockFullName) {
    return false;
  }

  if (expectedDob && mockDob && expectedDob !== mockDob) {
    return false;
  }

  if (expectedGender && mockGender && expectedGender !== mockGender) {
    return false;
  }

  return true;
}

function toMockPhotoDataUrl(initials: string, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" rx="48" fill="${fill}"/><circle cx="240" cy="180" r="84" fill="rgba(255,255,255,0.85)"/><path d="M120 390c22-71 86-112 120-112s98 41 120 112" fill="rgba(255,255,255,0.85)"/><text x="240" y="452" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#0f172a">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function toFixturePhotoDataUrl(fileName: string): string | null {
  const absolutePath = path.resolve(process.cwd(), '..', '..', 'fixtures', 'demo-images', fileName);
  if (!existsSync(absolutePath)) {
    return null;
  }
  const payload = readFileSync(absolutePath).toString('base64');
  return `data:image/jpeg;base64,${payload}`;
}

const LEASE_DRIVER_PROVIDER_PHOTO =
  toFixturePhotoDataUrl('lease-driver-provider.jpg') ?? toMockPhotoDataUrl('LD', '#fde68a');

const LOCAL_NIGERIA_MOCK_IDENTITIES: Record<string, NigeriaMockIdentity> = {
  'NATIONAL_ID:11111111111': {
    fullName: 'Lease Driver',
    dateOfBirth: '1989-04-21',
    address: '18 Admiralty Way, Lekki, Lagos',
    gender: 'male',
    photoUrl: LEASE_DRIVER_PROVIDER_PHOTO,
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:44444444444': {
    fullName: 'Ifeanyi Duru',
    dateOfBirth: '1990-08-14',
    address: '27 Isaac John Street, Ikeja GRA, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('ID', '#a7f3d0'),
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:55555555555': {
    fullName: 'Oluwaseyi Adelaju',
    dateOfBirth: '1988-09-12',
    address: '14 Admiralty Way, Lekki, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('OA', '#fcd34d'),
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:66666666666': {
    fullName: 'Kelechi Nwafor',
    dateOfBirth: '1991-06-19',
    address: '22 Admiralty Way, Lekki, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('KN', '#93c5fd'),
    verificationStatus: 'successful_match',
  },
  'DRIVERS_LICENSE:LIC-FTD-009': {
    fullName: 'Ifeanyi Duru',
    dateOfBirth: '1990-08-14',
    address: '27 Isaac John Street, Ikeja GRA, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('ID', '#a7f3d0'),
    verificationStatus: 'successful_match',
  },
  'DRIVERS_LICENSE:LIC-FTD-010': {
    fullName: 'Kelechi Nwafor',
    dateOfBirth: '1991-06-19',
    address: '22 Admiralty Way, Lekki, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('KN', '#93c5fd'),
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:77777777777': {
    fullName: 'Bimpe Adeyemi',
    dateOfBirth: '1987-02-24',
    address: '31 Isaac John Street, Ikeja GRA, Lagos',
    gender: 'female',
    photoUrl: toMockPhotoDataUrl('BA', '#f9a8d4'),
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:12345678901': {
    fullName: 'Adaobi Okafor',
    dateOfBirth: '1992-04-16',
    address: '12 Admiralty Way, Lekki, Lagos',
    gender: 'female',
    photoUrl: toMockPhotoDataUrl('AO', '#bfdbfe'),
    verificationStatus: 'successful_match',
  },
  'BANK_ID:22222222222': {
    fullName: 'Chinedu Balogun',
    dateOfBirth: '1989-11-03',
    address: '45 Allen Avenue, Ikeja, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('CB', '#c7d2fe'),
    verificationStatus: 'successful_match',
  },
  'NATIONAL_ID:12345678902': {
    fullName: 'Amaka Nwosu',
    dateOfBirth: '1994-07-11',
    address: '8 Bourdillon Road, Ikoyi, Lagos',
    gender: 'female',
    photoUrl: toMockPhotoDataUrl('AN', '#fecaca'),
    verificationStatus: 'face_mismatch',
    outcome: 'face_mismatch',
  },
  'BANK_ID:22222222223': {
    fullName: 'Tunde Lawal',
    dateOfBirth: '1987-02-08',
    address: '14 Isaac John Street, GRA, Lagos',
    gender: 'male',
    photoUrl: toMockPhotoDataUrl('TL', '#fde68a'),
    verificationStatus: 'face_mismatch',
    outcome: 'face_mismatch',
  },
};

function getLocalNigeriaMockVerification(
  identifier: VerificationIdentifierInput,
  providerVerification?: {
    subjectConsent?: boolean;
    validationData?: {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
    };
    selfieImageBase64?: string;
    selfieImageUrl?: string;
  },
): IdentityVerificationResult | null {
  if ((identifier.countryCode ?? 'NG').toUpperCase() !== 'NG') {
    return null;
  }

  if (!providerVerification?.selfieImageBase64 && !providerVerification?.selfieImageUrl) {
    return {
      status: 'no_match',
      providerName: 'youverify',
      matchedIdentifierType: identifier.type,
      verificationStatus: 'live_selfie_required',
      reason: 'A live selfie is required for local identity verification tests.',
    };
  }

  const mockIdentity = LOCAL_NIGERIA_MOCK_IDENTITIES[`${identifier.type}:${identifier.value}`];
  if (!mockIdentity) {
    return {
      status: 'no_match',
      providerName: 'youverify',
      matchedIdentifierType: identifier.type,
      verificationStatus: 'no_match',
      reason: 'No local mock identity matched the submitted identifier.',
    };
  }

  if (!doesLocalMockMatchValidation(mockIdentity, providerVerification)) {
    return {
      status: 'no_match',
      providerName: 'youverify',
      matchedIdentifierType: identifier.type,
      verificationStatus: 'validation_mismatch',
      enrichment: {
        fullName: mockIdentity.fullName,
        dateOfBirth: mockIdentity.dateOfBirth,
        address: mockIdentity.address,
        gender: mockIdentity.gender,
        photoUrl: mockIdentity.photoUrl,
      },
      reason:
        'The submitted identity details do not match the verification record for this identifier.',
    };
  }

  if (mockIdentity.outcome === 'face_mismatch') {
    return {
      status: 'no_match',
      providerName: 'youverify',
      matchedIdentifierType: identifier.type,
      verificationStatus: mockIdentity.verificationStatus,
      enrichment: {
        fullName: mockIdentity.fullName,
        dateOfBirth: mockIdentity.dateOfBirth,
        address: mockIdentity.address,
        gender: mockIdentity.gender,
        photoUrl: mockIdentity.photoUrl,
      },
      reason: 'The submitted selfie does not match the verification record for this identifier.',
    };
  }

  return {
    status: 'verified',
    providerName: 'youverify',
    verificationStatus: mockIdentity.verificationStatus,
    matchedIdentifierType: identifier.type,
    documentMetadata: {
      validity: 'valid',
      portraitAvailable: true,
      ...(identifier.type === 'DRIVERS_LICENSE' ? { issueDate: '2022-01-14' } : {}),
      ...(identifier.type === 'DRIVERS_LICENSE' ? { expiryDate: '2028-01-14' } : {}),
      ...(identifier.type === 'DRIVERS_LICENSE' ? { stateOfIssuance: 'Lagos' } : {}),
      ...(identifier.type === 'DRIVERS_LICENSE' ? { licenceClass: 'B' } : {}),
    },
    enrichment: {
      fullName: mockIdentity.fullName,
      dateOfBirth: mockIdentity.dateOfBirth,
      address: mockIdentity.address,
      gender: mockIdentity.gender,
      photoUrl: mockIdentity.photoUrl,
    },
    auditData: {
      validations: {
        selfie: {
          match: true,
          confidenceLevel: 98,
        },
      },
    },
  };
}

function shouldPreferLocalNigeriaMock(configService: ConfigService): boolean {
  const explicitMode = configService.get<string>('IDENTITY_PROVIDER_MOCK_MODE');
  if (explicitMode === 'true') {
    return true;
  }

  const explicitPreference = configService.get<string>('PREFER_LOCAL_NIGERIA_IDENTITY_MOCK');
  if (explicitPreference === 'true') {
    return true;
  }

  return configService.get<string>('NODE_ENV') !== 'production';
}

@Injectable()
export class YouVerifyProvider implements IdentityProviderAdapter {
  readonly name = 'youverify';
  private readonly logger = new Logger(YouVerifyProvider.name);

  constructor(private readonly configService: ConfigService) {}

  canVerify(identifiers: VerificationIdentifierInput[]): boolean {
    return firstIdentifier(identifiers) !== undefined;
  }

  async verify(
    identifiers: VerificationIdentifierInput[],
    providerVerification?: {
      subjectConsent?: boolean;
      validationData?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
      };
      selfieImageBase64?: string;
      selfieImageUrl?: string;
    },
  ): Promise<IdentityVerificationResult> {
    const identifier = firstIdentifier(identifiers);
    if (!identifier) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: 'no supported identifier available for YouVerify',
      };
    }

    if (providerVerification?.subjectConsent !== true) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: 'YouVerify requires subject consent before lookup',
      };
    }

    const localNigeriaMock = getLocalNigeriaMockVerification(identifier, providerVerification);
    if (localNigeriaMock && shouldPreferLocalNigeriaMock(this.configService)) {
      return localNigeriaMock;
    }

    const mockResponse = this.configService.get<string>('YOUVERIFY_MOCK_RESPONSE');
    if (mockResponse) {
      return this.normalizeMockResponse(identifier.type, mockResponse);
    }

    const apiKey = this.configService.get<string>('YOUVERIFY_API_KEY');
    const baseUrl = this.configService.get<string>('YOUVERIFY_BASE_URL');

    // No live credentials — fall back to local mock only in non-production
    if (!apiKey || !baseUrl || isPlaceholderCredential(apiKey)) {
      const localMockMode =
        this.configService.get<string>('IDENTITY_PROVIDER_MOCK_MODE') === 'true' ||
        this.configService.get<string>('NODE_ENV') !== 'production';
      if (localMockMode) {
        if (localNigeriaMock) {
          return localNigeriaMock;
        }
      }
      return {
        status: 'provider_unavailable',
        providerName: this.name,
        reason: 'YouVerify credentials or base URL not configured',
      };
    }

    const countrySlug = (identifier.countryCode ?? 'NG').toLowerCase();
    const identifierSlug = YOUVERIFY_IDENTIFIER_PATH[identifier.type];
    if (!identifierSlug) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: `YouVerify has no endpoint mapping for identifier type ${identifier.type}`,
      };
    }

    try {
      const endpointPath = `/v2/api/identity/${countrySlug}/${identifierSlug}`;
      const requestBody = await this.buildRequestBody(identifier, providerVerification);

      this.logger.log(
        JSON.stringify({
          event: 'youverify_nin_request',
          endpoint: endpointPath,
          identifierType: identifier.type,
          hasSelfie: 'selfie' in requestBody,
          hasValidation: 'validation' in requestBody,
          premiumNIN: Boolean((requestBody as Record<string, unknown>).premiumNIN),
        }),
      );

      const response = await requestProviderJson({
        providerName: this.name,
        operation: `lookup:${identifierSlug}`,
        method: 'POST',
        url: `${baseUrl.replace(/\/$/, '')}${endpointPath}`,
        headers: { token: apiKey },
        body: requestBody,
      });

      this.logger.log(
        JSON.stringify({
          event: 'youverify_nin_response',
          statusCode: response.statusCode,
          identifierType: identifier.type,
        }),
      );

      const httpFailure = summarizeProviderFailure(this.name, `lookup:${identifierSlug}`, response);
      if (httpFailure) {
        this.logger.warn(
          JSON.stringify({
            event: 'youverify_nin_http_failure',
            identifierType: identifier.type,
            reason: httpFailure,
            statusCode: response.statusCode,
          }),
        );
        return {
          status: 'provider_error',
          providerName: this.name,
          reason: httpFailure,
        };
      }

      if (!isRecord(response.payload)) {
        return {
          status: 'provider_error',
          providerName: this.name,
          reason: `YouVerify returned a non-object response with status ${response.statusCode}`,
        };
      }

      const normalized = normalizeYouVerifyResponse(this.name, identifier.type, response.payload);

      this.logger.log(
        JSON.stringify({
          event: 'youverify_nin_normalized',
          identifierType: identifier.type,
          status: normalized.status,
          verificationStatus: normalized.verificationStatus ?? null,
          hasFullName: Boolean(normalized.enrichment?.fullName),
          portraitAvailable: normalized.documentMetadata?.portraitAvailable ?? false,
        }),
      );

      return normalized;
    } catch (error) {
      return {
        status: 'provider_error',
        providerName: this.name,
        reason: error instanceof Error ? error.message : 'YouVerify request failed unexpectedly',
      };
    }
  }

  private normalizeMockResponse(
    identifierType: string,
    mockResponse: string,
  ): IdentityVerificationResult {
    const payload = JSON.parse(mockResponse) as Record<string, unknown>;

    return {
      ...normalizeYouVerifyResponse(this.name, identifierType, {
        message:
          typeof payload.verificationStatus === 'string'
            ? payload.verificationStatus
            : 'unverified',
        data: {
          status: payload.status === 'verified' ? 'found' : 'not_found',
          firstName: payload.fullName,
          dateOfBirth: payload.dateOfBirth,
          address: payload.address,
          gender: payload.gender,
          image: payload.photoUrl,
        },
      }),
    };
  }

  private async buildRequestBody(
    identifier: VerificationIdentifierInput,
    providerVerification?: {
      subjectConsent?: boolean;
      validationData?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
      };
      selfieImageBase64?: string;
      selfieImageUrl?: string;
    },
  ): Promise<Record<string, unknown>> {
    return {
      id: identifier.value,
      isSubjectConsent: providerVerification?.subjectConsent ?? true,
    };
  }

  private async resolveSelfieImage(providerVerification?: {
    selfieImageBase64?: string;
    selfieImageUrl?: string;
  }): Promise<string | undefined> {
    const base64 = providerVerification?.selfieImageBase64?.trim();
    if (base64) {
      return base64;
    }

    const imageUrl = providerVerification?.selfieImageUrl?.trim();
    if (!imageUrl) {
      return undefined;
    }

    const dataUrlMatch = imageUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    if (dataUrlMatch?.[1]) {
      return dataUrlMatch[1];
    }

    if (!/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    try {
      const safeUrl = await assertPublicSelfieUrl(imageUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SELFIE_FETCH_TIMEOUT_MS);
      let response: Response;
      try {
        response = await fetch(safeUrl, {
          signal: controller.signal,
          redirect: 'error',
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!response.ok) {
        this.logger.warn(
          JSON.stringify({
            event: 'youverify_selfie_fetch_failed',
            statusCode: response.status,
          }),
        );
        return imageUrl;
      }

      const contentLength = Number.parseInt(response.headers.get('content-length') ?? '', 10);
      if (Number.isFinite(contentLength) && contentLength > 5 * 1024 * 1024) {
        this.logger.warn(
          JSON.stringify({
            event: 'youverify_selfie_fetch_rejected',
            reason: 'image_too_large',
            contentLength,
          }),
        );
        return imageUrl;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'youverify_selfie_fetch_error',
          reason: error instanceof Error ? error.message : 'unknown_error',
        }),
      );
      return imageUrl;
    }
  }
}

// ── Smile Identity helpers ─────────────────────────────────────────────────

const SMILE_IDENTITY_ID_TYPE_MAP: Record<string, string> = {
  NATIONAL_ID: 'NIN_NO_PHOTO',
  BANK_ID: 'BVN',
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  VOTERS_CARD: 'VOTER_ID',
};

function smileIdentitySignature(apiKey: string, partnerId: string, timestamp: string): string {
  const { createHmac } = require('node:crypto') as typeof import('node:crypto');
  return createHmac('sha256', apiKey)
    .update(`${timestamp}${partnerId}sid_request`)
    .digest('base64');
}

function normalizeSmileIdentityResponse(
  providerName: string,
  identifierType: string,
  payload: Record<string, unknown>,
): IdentityVerificationResult {
  const resultCode = typeof payload.ResultCode === 'string' ? payload.ResultCode : '';
  // 1012 = exact match, 1013 = partial match — both count as verified
  const verified = resultCode === '1012' || resultCode === '1013';
  const fullName =
    typeof payload.FullName === 'string' && payload.FullName.length > 0
      ? payload.FullName
      : undefined;

  return {
    status: verified ? 'verified' : 'no_match',
    providerName,
    verificationStatus: typeof payload.ResultText === 'string' ? payload.ResultText : 'unverified',
    matchedIdentifierType: identifierType,
    documentMetadata: {
      validity:
        typeof payload.IsValid === 'boolean' ? (payload.IsValid ? 'valid' : 'invalid') : 'unknown',
      ...optionalStringProperty(
        'issueDate',
        typeof payload.IssueDate === 'string' ? payload.IssueDate : payload.IssuedDate,
      ),
      ...optionalStringProperty(
        'expiryDate',
        typeof payload.ExpiryDate === 'string' ? payload.ExpiryDate : payload.ExpirationDate,
      ),
      portraitAvailable:
        typeof payload.Photo === 'string'
          ? payload.Photo.trim().length > 0
          : typeof payload.photoUrl === 'string' && payload.photoUrl.trim().length > 0,
    },
    enrichment: {
      ...(fullName ? { fullName } : {}),
      ...(typeof payload.DOB === 'string' ? { dateOfBirth: payload.DOB } : {}),
      ...(typeof payload.Gender === 'string' ? { gender: payload.Gender } : {}),
      ...(typeof payload.Country === 'string' ? { address: payload.Country } : {}),
    },
  };
}

@Injectable()
export class SmileIdentityProvider implements IdentityProviderAdapter {
  readonly name = 'smile_identity';

  constructor(private readonly configService: ConfigService) {}

  canVerify(identifiers: VerificationIdentifierInput[]): boolean {
    return firstIdentifier(identifiers) !== undefined;
  }

  async verify(
    identifiers: VerificationIdentifierInput[],
    providerVerification?: {
      subjectConsent?: boolean;
      validationData?: {
        firstName?: string;
        middleName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
      };
      selfieImageBase64?: string;
      selfieImageUrl?: string;
    },
  ): Promise<IdentityVerificationResult> {
    const identifier = firstIdentifier(identifiers);
    if (!identifier) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: 'no supported identifier available for Smile Identity',
      };
    }

    const mockResponse = this.configService.get<string>('SMILE_IDENTITY_MOCK_RESPONSE');
    if (mockResponse) {
      return this.normalizeMockResponse(identifier.type, mockResponse);
    }

    const apiKey = this.configService.get<string>('SMILE_IDENTITY_API_KEY');
    const partnerId = this.configService.get<string>('SMILE_IDENTITY_PARTNER_ID');
    const baseUrl = this.configService.get<string>('SMILE_IDENTITY_BASE_URL');

    if (!apiKey || !partnerId || !baseUrl || isPlaceholderCredential(apiKey)) {
      return {
        status: 'provider_unavailable',
        providerName: this.name,
        reason:
          'Smile Identity credentials not fully configured (SMILE_IDENTITY_API_KEY, SMILE_IDENTITY_PARTNER_ID, SMILE_IDENTITY_BASE_URL required)',
      };
    }

    if (providerVerification?.subjectConsent !== true) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: 'Smile Identity requires subject consent before lookup',
      };
    }

    const idTypeSlug = SMILE_IDENTITY_ID_TYPE_MAP[identifier.type];
    if (!idTypeSlug) {
      return {
        status: 'skipped',
        providerName: this.name,
        reason: `Smile Identity has no mapping for identifier type ${identifier.type}`,
      };
    }

    const countryCode = (identifier.countryCode ?? 'NG').toUpperCase();
    const timestamp = new Date().toISOString();
    const signature = smileIdentitySignature(apiKey, partnerId, timestamp);

    try {
      const response = await requestProviderJson({
        providerName: this.name,
        operation: `lookup:${idTypeSlug}`,
        method: 'POST',
        url: `${baseUrl.replace(/\/$/, '')}/v1/id_verification`,
        body: {
          partner_id: partnerId,
          timestamp,
          signature,
          country: countryCode,
          id_type: idTypeSlug,
          id_number: identifier.value,
          ...(providerVerification?.validationData?.firstName
            ? { first_name: providerVerification.validationData.firstName }
            : {}),
          ...(providerVerification?.validationData?.lastName
            ? { last_name: providerVerification.validationData.lastName }
            : {}),
          ...(providerVerification?.validationData?.dateOfBirth
            ? { dob: providerVerification.validationData.dateOfBirth }
            : {}),
        },
      });

      const httpFailure = summarizeProviderFailure(this.name, `lookup:${idTypeSlug}`, response);
      if (httpFailure) {
        return {
          status: 'provider_error',
          providerName: this.name,
          reason: httpFailure,
        };
      }

      if (!isRecord(response.payload)) {
        return {
          status: 'provider_error',
          providerName: this.name,
          reason: `Smile Identity returned a non-object response with status ${response.statusCode}`,
        };
      }

      return normalizeSmileIdentityResponse(this.name, identifier.type, response.payload);
    } catch (error) {
      return {
        status: 'provider_error',
        providerName: this.name,
        reason:
          error instanceof Error ? error.message : 'Smile Identity request failed unexpectedly',
      };
    }
  }

  private normalizeMockResponse(
    identifierType: string,
    mockResponse: string,
  ): IdentityVerificationResult {
    const payload = JSON.parse(mockResponse) as Record<string, unknown>;
    const result = typeof payload.result === 'string' ? payload.result.toLowerCase() : '';

    return {
      status: result === 'verified' ? 'verified' : 'no_match',
      providerName: this.name,
      verificationStatus:
        typeof payload.verificationStatus === 'string' ? payload.verificationStatus : 'unverified',
      matchedIdentifierType: identifierType,
      documentMetadata: {
        validity:
          typeof payload.validity === 'string' &&
          ['valid', 'invalid', 'unknown'].includes(payload.validity.toLowerCase())
            ? (payload.validity.toLowerCase() as 'valid' | 'invalid' | 'unknown')
            : 'unknown',
        ...optionalStringProperty('issueDate', payload.issueDate),
        ...optionalStringProperty('expiryDate', payload.expiryDate),
        portraitAvailable:
          typeof payload.portraitAvailable === 'boolean'
            ? payload.portraitAvailable
            : typeof payload.photoUrl === 'string' && payload.photoUrl.length > 0,
      },
      enrichment: {
        ...optionalStringProperty('fullName', payload.fullName),
        ...optionalStringProperty('dateOfBirth', payload.dateOfBirth),
        ...optionalStringProperty('address', payload.address),
        ...optionalStringProperty('gender', payload.gender),
        ...optionalStringProperty('photoUrl', payload.photoUrl),
      },
    };
  }
}
