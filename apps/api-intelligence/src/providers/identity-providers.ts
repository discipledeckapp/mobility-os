import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: NestJS DI requires a runtime value for constructor metadata.
import { ConfigService } from '@nestjs/config';

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
  enrichment?: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    gender?: string;
    photoUrl?: string;
  };
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
        lastName?: string;
        dateOfBirth?: string;
      };
      selfieImageBase64?: string;
    },
  ): Promise<IdentityVerificationResult>;
}

// YouVerify-specific path segments per identifier type (provider API contract, not country logic)
const YOUVERIFY_IDENTIFIER_PATH: Record<string, string> = {
  NATIONAL_ID: 'nin',
  BANK_ID: 'bvn',
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

function normalizeYouVerifyResponse(
  providerName: string,
  identifierType: string,
  payload: Record<string, unknown>,
): IdentityVerificationResult {
  const data = isRecord(payload.data) ? payload.data : {};
  const status = typeof data.status === 'string' ? data.status.toLowerCase() : '';
  const verificationStatus =
    typeof payload.message === 'string'
      ? payload.message
      : typeof data.status === 'string'
        ? data.status
        : 'unverified';

  return {
    status: status === 'found' ? 'verified' : 'no_match',
    providerName,
    verificationStatus,
    matchedIdentifierType: identifierType,
    enrichment: {
      ...optionalStringProperty(
        'fullName',
        joinNameParts([data.firstName, data.middleName, data.lastName]),
      ),
      ...optionalStringProperty('dateOfBirth', data.dateOfBirth),
      ...optionalStringProperty('address', data.address),
      ...optionalStringProperty('gender', data.gender),
      ...optionalStringProperty('photoUrl', data.image),
    },
    ...(typeof data.reason === 'string' ? { reason: data.reason } : {}),
  };
}

function postJson(
  urlString: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
): Promise<{ statusCode: number; payload: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const serializedBody = JSON.stringify(body);
    const request = httpsRequest(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(serializedBody).toString(),
          ...headers,
        },
      },
      (response) => {
        let responseBody = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          try {
            resolve({
              statusCode: response.statusCode ?? 500,
              payload: responseBody.length > 0 ? JSON.parse(responseBody) : {},
            });
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    request.on('error', reject);
    request.write(serializedBody);
    request.end();
  });
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

function toMockPhotoDataUrl(initials: string, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" rx="48" fill="${fill}"/><circle cx="240" cy="180" r="84" fill="rgba(255,255,255,0.85)"/><path d="M120 390c22-71 86-112 120-112s98 41 120 112" fill="rgba(255,255,255,0.85)"/><text x="240" y="452" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#0f172a">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const LOCAL_NIGERIA_MOCK_IDENTITIES: Record<string, NigeriaMockIdentity> = {
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
      lastName?: string;
      dateOfBirth?: string;
    };
    selfieImageBase64?: string;
  },
): IdentityVerificationResult | null {
  if ((identifier.countryCode ?? 'NG').toUpperCase() !== 'NG') {
    return null;
  }

  if (!providerVerification?.selfieImageBase64) {
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
    enrichment: {
      fullName: mockIdentity.fullName,
      dateOfBirth: mockIdentity.dateOfBirth,
      address: mockIdentity.address,
      gender: mockIdentity.gender,
      photoUrl: mockIdentity.photoUrl,
    },
  };
}

@Injectable()
export class YouVerifyProvider implements IdentityProviderAdapter {
  readonly name = 'youverify';

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
        lastName?: string;
        dateOfBirth?: string;
      };
      selfieImageBase64?: string;
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

    const mockResponse = this.configService.get<string>('YOUVERIFY_MOCK_RESPONSE');
    if (mockResponse) {
      return this.normalizeMockResponse(identifier.type, mockResponse);
    }

    const apiKey = this.configService.get<string>('YOUVERIFY_API_KEY');
    const baseUrl = this.configService.get<string>('YOUVERIFY_BASE_URL');

    // No live credentials — fall back to local mock only in non-production
    if (!apiKey || !baseUrl) {
      const localMockMode =
        this.configService.get<string>('IDENTITY_PROVIDER_MOCK_MODE') === 'true' ||
        this.configService.get<string>('NODE_ENV') !== 'production';
      if (localMockMode) {
        const localMock = getLocalNigeriaMockVerification(identifier, providerVerification);
        if (localMock) {
          return localMock;
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
      const response = await postJson(
        `${baseUrl.replace(/\/$/, '')}${endpointPath}`,
        { token: apiKey },
        this.buildRequestBody(identifier, providerVerification),
      );

      if (!isRecord(response.payload)) {
        return {
          status: 'provider_error',
          providerName: this.name,
          reason: `YouVerify returned a non-object response with status ${response.statusCode}`,
        };
      }

      return normalizeYouVerifyResponse(this.name, identifier.type, response.payload);
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

  private buildRequestBody(
    identifier: VerificationIdentifierInput,
    providerVerification?: {
      subjectConsent?: boolean;
      validationData?: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
      };
      selfieImageBase64?: string;
    },
  ): Record<string, unknown> {
    return {
      id: identifier.value,
      isSubjectConsent: true,
      ...(providerVerification?.validationData
        ? {
            validation: {
              data: {
                ...(providerVerification.validationData.firstName
                  ? { firstName: providerVerification.validationData.firstName }
                  : {}),
                ...(providerVerification.validationData.lastName
                  ? { lastName: providerVerification.validationData.lastName }
                  : {}),
                ...(providerVerification.validationData.dateOfBirth
                  ? { dateOfBirth: providerVerification.validationData.dateOfBirth }
                  : {}),
              },
            },
          }
        : {}),
      ...(providerVerification?.selfieImageBase64
        ? {
            selfie: {
              image: providerVerification.selfieImageBase64,
            },
          }
        : {}),
      ...(identifier.type === 'BANK_ID' ? { premiumBVN: true } : {}),
      ...(identifier.type === 'NATIONAL_ID' ? { premiumNIN: true } : {}),
    };
  }
}

// ── Smile Identity helpers ─────────────────────────────────────────────────

const SMILE_IDENTITY_ID_TYPE_MAP: Record<string, string> = {
  NATIONAL_ID: 'NIN_NO_PHOTO',
  BANK_ID: 'BVN',
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
    verificationStatus:
      typeof payload.ResultText === 'string' ? payload.ResultText : 'unverified',
    matchedIdentifierType: identifierType,
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
        lastName?: string;
        dateOfBirth?: string;
      };
      selfieImageBase64?: string;
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

    if (!apiKey || !partnerId || !baseUrl) {
      return {
        status: 'provider_unavailable',
        providerName: this.name,
        reason: 'Smile Identity credentials not fully configured (SMILE_IDENTITY_API_KEY, SMILE_IDENTITY_PARTNER_ID, SMILE_IDENTITY_BASE_URL required)',
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
      const response = await postJson(
        `${baseUrl.replace(/\/$/, '')}/v1/id_verification`,
        {},
        {
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
      );

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
        reason: error instanceof Error ? error.message : 'Smile Identity request failed unexpectedly',
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
