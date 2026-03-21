import { createHash, createHmac } from 'node:crypto';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';
import {
  type IdentityVerificationProviderCapability,
  getCountryConfig,
} from '@mobility-os/domain-config';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import {
  ControlPlaneSettingsClient,
  DEFAULT_LIVENESS_ROUTING,
} from './control-plane-settings.client';

export interface LivenessCheckInput {
  countryCode: string;
  livenessPassed?: boolean;
  evidence?: {
    provider?: string;
    sessionId?: string;
    passed?: boolean;
    confidenceScore?: number;
  };
}

export interface LivenessCheckResult {
  attempted: boolean;
  passed: boolean;
  fallbackChain: string[];
  providerName?: string;
  confidenceScore?: number;
  reason?: string;
}

export interface LivenessSessionInitInput {
  countryCode: string;
  tenantId: string;
}

export interface LivenessSessionInitResult {
  providerName: string;
  sessionId: string;
  expiresAt?: string;
  /** Provider-issued client auth token (Azure Face authToken, etc.) */
  clientAuthToken?: string;
  fallbackChain: string[];
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hmac(key: string | Buffer, value: string): Buffer {
  return createHmac('sha256', key).update(value, 'utf8').digest();
}

function postAwsJson(
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  target: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const host = `rekognition.${region}.amazonaws.com`;
    const url = new URL(`https://${host}/`);
    const payload = JSON.stringify(body);
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const canonicalHeaders = `content-type:application/x-amz-json-1.1\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:${target}\n`;
    const signedHeaders = 'content-type;host;x-amz-date;x-amz-target';
    const canonicalRequest = [
      'POST',
      '/',
      '',
      canonicalHeaders,
      signedHeaders,
      sha256Hex(payload),
    ].join('\n');
    const credentialScope = `${dateStamp}/${region}/rekognition/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join('\n');
    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, 'rekognition');
    const kSigning = hmac(kService, 'aws4_request');
    const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');
    const authorization =
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const req = httpsRequest(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        path: '/',
        method: 'POST',
        headers: {
          'content-type': 'application/x-amz-json-1.1',
          'content-length': Buffer.byteLength(payload).toString(),
          'x-amz-date': amzDate,
          'x-amz-target': target,
          authorization,
        },
      },
      (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          try {
            resolve(responseBody ? JSON.parse(responseBody) : {});
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
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

function getJson(
  urlString: string,
  headers: Record<string, string>,
): Promise<{ statusCode: number; payload: unknown }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const request = httpsRequest(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: { accept: 'application/json', ...headers },
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
    request.end();
  });
}

@Injectable()
export class LivenessService {
  constructor(
    private readonly configService: ConfigService,
    private readonly controlPlaneSettingsClient: ControlPlaneSettingsClient,
  ) {}

  async evaluate(input: LivenessCheckInput): Promise<LivenessCheckResult> {
    if (input.livenessPassed === true) {
      return {
        attempted: true,
        passed: true,
        fallbackChain: ['preverified:true'],
      };
    }

    if (input.livenessPassed === false) {
      return {
        attempted: true,
        passed: false,
        fallbackChain: ['preverified:false'],
        reason: 'submitted liveness flag indicates failure',
      };
    }

    const routingOverride =
      (await this.controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry(
        input.countryCode,
      )) ?? DEFAULT_LIVENESS_ROUTING;
    const providerCapabilities = new Map<string, IdentityVerificationProviderCapability>(
      (getCountryConfig(input.countryCode).identityVerification?.providerCapabilities ?? []).map(
        (provider) => [provider.name, provider],
      ),
    );
    const providers = [...routingOverride.livenessProviders]
      .filter((provider) => provider.enabled)
      .filter((provider) => providerCapabilities.get(provider.name)?.supportsLiveness)
      .sort((left, right) => left.priority - right.priority);

    const fallbackChain: string[] = [];

    for (const provider of providers) {
      const result = await this.evaluateProvider(provider.name, input.evidence);
      fallbackChain.push(
        `${provider.name}:${result.reason ?? (result.passed ? 'passed' : 'failed')}`,
      );

      if (result.reason === 'provider_unavailable' || result.reason === 'provider_error') {
        continue;
      }

      return {
        attempted: true,
        passed: result.passed,
        fallbackChain,
        providerName: provider.name,
        ...(result.confidenceScore !== undefined
          ? { confidenceScore: result.confidenceScore }
          : {}),
        ...(result.reason ? { reason: result.reason } : {}),
      };
    }

    return {
      attempted: fallbackChain.length > 0,
      passed: false,
      fallbackChain,
      reason:
        fallbackChain.length > 0
          ? 'all configured liveness providers were unavailable'
          : 'no liveness evidence or configured providers available',
    };
  }

  async initializeSession(input: LivenessSessionInitInput): Promise<LivenessSessionInitResult> {
    const routingOverride =
      (await this.controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry(
        input.countryCode,
      )) ?? DEFAULT_LIVENESS_ROUTING;
    const providerCapabilities = new Map<string, IdentityVerificationProviderCapability>(
      (getCountryConfig(input.countryCode).identityVerification?.providerCapabilities ?? []).map(
        (provider) => [provider.name, provider],
      ),
    );
    const providers = [...routingOverride.livenessProviders]
      .filter((provider) => provider.enabled)
      .filter((provider) => providerCapabilities.get(provider.name)?.supportsLiveness)
      .sort((left, right) => left.priority - right.priority);

    const fallbackChain: string[] = [];

    for (const provider of providers) {
      const session = await this.initializeProviderSession(provider.name, input);
      fallbackChain.push(`${provider.name}:${session.reason ?? 'initialized'}`);

      if (session.sessionId) {
        return {
          providerName: provider.name,
          sessionId: session.sessionId,
          ...(session.expiresAt ? { expiresAt: session.expiresAt } : {}),
          ...(session.clientAuthToken ? { clientAuthToken: session.clientAuthToken } : {}),
          fallbackChain,
        };
      }

      if (session.reason !== 'provider_unavailable' && session.reason !== 'provider_error') {
        break;
      }
    }

    throw new Error(`Unable to initialize liveness session for country '${input.countryCode}'`);
  }

  private async evaluateProvider(
    providerName: string,
    evidence?: LivenessCheckInput['evidence'],
  ): Promise<{ passed: boolean; confidenceScore?: number; reason?: string }> {
    switch (providerName) {
      case 'azure_face':
        return this.evaluateAzureFace(evidence);
      case 'amazon_rekognition':
        return this.evaluateAmazonRekognition(evidence);
      case 'youverify':
        return this.evaluateMockProvider('YOUVERIFY_LIVENESS_MOCK_RESPONSE', evidence);
      case 'smile_identity':
        return this.evaluateMockProvider('SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE', evidence);
      case 'internal_free_service':
        return this.evaluateInlineEvidence(evidence);
      default:
        return { passed: false, reason: 'provider_unavailable' };
    }
  }

  private async initializeProviderSession(
    providerName: string,
    input: LivenessSessionInitInput,
  ): Promise<{
    sessionId?: string;
    clientAuthToken?: string;
    expiresAt?: string;
    reason?: string;
  }> {
    switch (providerName) {
      case 'azure_face':
        return this.initializeAzureFaceSession();
      case 'amazon_rekognition':
        return this.initializeAmazonRekognitionSession();
      case 'youverify':
        return this.initializeYouVerifySession(input);
      case 'smile_identity':
        return this.initializeMockSession('SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE', 'smile');
      case 'internal_free_service':
        return {
          sessionId: `internal-free-${input.tenantId}-${Date.now()}`,
          reason: 'initialized',
        };
      default:
        return { reason: 'provider_unavailable' };
    }
  }

  // ── Azure AI Face ───────────────────────────────────────────────────────────

  private async initializeAzureFaceSession(): Promise<{
    sessionId?: string;
    clientAuthToken?: string;
    expiresAt?: string;
    reason?: string;
  }> {
    const mock = this.configService.get<string>('AZURE_FACE_LIVENESS_MOCK_RESPONSE');
    if (mock) {
      return {
        sessionId: 'azure-mock-session',
        clientAuthToken: 'azure-mock-auth-token',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        reason: 'initialized',
      };
    }

    const endpoint = this.configService.get<string>('AZURE_FACE_ENDPOINT');
    const apiKey = this.configService.get<string>('AZURE_FACE_API_KEY');
    if (!endpoint || !apiKey) {
      return { reason: 'provider_unavailable' };
    }

    try {
      const url = `${endpoint.replace(/\/$/, '')}/face/v1.2/detectLiveness/singleModal/sessions`;
      const response = (await postJson(
        url,
        { 'Ocp-Apim-Subscription-Key': apiKey },
        {
          livenessOperationMode: 'Passive',
          sendResultsToClient: false,
          authTokenTimeToLiveInSeconds: 60,
        },
      )) as { statusCode: number; payload: unknown };

      const payload = response.payload as {
        sessionId?: string;
        authToken?: string;
      };

      if (!payload.sessionId) {
        return { reason: 'provider_error' };
      }

      return {
        sessionId: payload.sessionId,
        ...(payload.authToken ? { clientAuthToken: payload.authToken } : {}),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        reason: 'initialized',
      };
    } catch {
      return { reason: 'provider_error' };
    }
  }

  private async evaluateAzureFace(
    evidence?: LivenessCheckInput['evidence'],
  ): Promise<{ passed: boolean; confidenceScore?: number; reason?: string }> {
    const mock = this.configService.get<string>('AZURE_FACE_LIVENESS_MOCK_RESPONSE');
    if (mock) {
      const payload = JSON.parse(mock) as { passed?: boolean; confidenceScore?: number };
      return {
        passed: payload.passed === true,
        ...(payload.confidenceScore !== undefined
          ? { confidenceScore: payload.confidenceScore }
          : {}),
        reason: payload.passed === true ? 'passed' : 'failed',
      };
    }

    if (!evidence?.sessionId) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    const endpoint = this.configService.get<string>('AZURE_FACE_ENDPOINT');
    const apiKey = this.configService.get<string>('AZURE_FACE_API_KEY');
    if (!endpoint || !apiKey) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    try {
      const url = `${endpoint.replace(/\/$/, '')}/face/v1.2/detectLiveness/singleModal/sessions/${encodeURIComponent(evidence.sessionId)}`;
      const response = (await getJson(url, {
        'Ocp-Apim-Subscription-Key': apiKey,
      })) as { statusCode: number; payload: unknown };

      if (response.statusCode !== 200) {
        return { passed: false, reason: 'provider_error' };
      }

      const payload = response.payload as {
        status?: string;
        result?: {
          livenessDecision?: string;
          score?: number;
        };
      };

      if (payload.status !== 'ResultAvailable' || !payload.result) {
        return { passed: false, reason: 'session_pending' };
      }

      const minConfidence =
        this.configService.get<number>('AZURE_FACE_LIVENESS_MIN_CONFIDENCE') ?? 0.7;
      const score = payload.result.score ?? 0;
      const passed = payload.result.livenessDecision === 'realface' && score >= minConfidence;

      return {
        passed,
        confidenceScore: Math.round(score * 100),
        reason: passed
          ? 'passed'
          : payload.result.livenessDecision === 'spoofface'
            ? 'spoof_detected'
            : 'failed',
      };
    } catch {
      return { passed: false, reason: 'provider_error' };
    }
  }

  private async initializeAmazonRekognitionSession(): Promise<{
    sessionId?: string;
    expiresAt?: string;
    reason?: string;
  }> {
    const mock = this.configService.get<string>('AWS_REKOGNITION_MOCK_LIVENESS_RESPONSE');
    if (mock) {
      return {
        sessionId: 'aws-mock-session',
        reason: 'initialized',
      };
    }

    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    if (!region || !accessKeyId || !secretAccessKey) {
      return { reason: 'provider_unavailable' };
    }

    try {
      const payload = (await postAwsJson(
        region,
        accessKeyId,
        secretAccessKey,
        'RekognitionService.CreateFaceLivenessSession',
        {
          ClientRequestToken: `mobility-os-${Date.now()}`,
        },
      )) as { SessionId?: string };

      return payload.SessionId
        ? { sessionId: payload.SessionId, reason: 'initialized' }
        : { reason: 'provider_error' };
    } catch {
      return { reason: 'provider_error' };
    }
  }

  private async initializeYouVerifySession(
    input: LivenessSessionInitInput,
  ): Promise<{ sessionId?: string; expiresAt?: string; reason?: string }> {
    const mock = this.configService.get<string>('YOUVERIFY_LIVENESS_MOCK_RESPONSE');
    if (mock) {
      return {
        sessionId: 'youverify-mock-session',
        expiresAt: new Date(Date.now() + 120_000).toISOString(),
        reason: 'initialized',
      };
    }

    const apiKey = this.configService.get<string>('YOUVERIFY_API_KEY');
    const baseUrl = this.configService.get<string>('YOUVERIFY_BASE_URL');
    if (!apiKey || !baseUrl) {
      return { reason: 'provider_unavailable' };
    }

    try {
      const response = (await postJson(
        `${baseUrl.replace(/\/$/, '')}/v2/api/identity/sdk/liveness/session/generate`,
        { token: apiKey },
        {
          ttlSeconds: 120,
          metadata: {
            tenantId: input.tenantId,
            countryCode: input.countryCode,
          },
        },
      )) as { statusCode: number; payload: unknown };

      const payload = response.payload as {
        data?: { sessionId?: string; expiresAt?: string };
      };
      return payload.data?.sessionId
        ? {
            sessionId: payload.data.sessionId,
            ...(payload.data.expiresAt ? { expiresAt: payload.data.expiresAt } : {}),
            reason: 'initialized',
          }
        : { reason: 'provider_error' };
    } catch {
      return { reason: 'provider_error' };
    }
  }

  private initializeMockSession(
    envKey: string,
    prefix: string,
  ): { sessionId?: string; reason?: string } {
    const mock = this.configService.get<string>(envKey);
    if (!mock) {
      return { reason: 'provider_unavailable' };
    }

    return {
      sessionId: `${prefix}-mock-session`,
      reason: 'initialized',
    };
  }

  private async evaluateAmazonRekognition(
    evidence?: LivenessCheckInput['evidence'],
  ): Promise<{ passed: boolean; confidenceScore?: number; reason?: string }> {
    const mock = this.configService.get<string>('AWS_REKOGNITION_MOCK_LIVENESS_RESPONSE');
    if (mock) {
      const payload = JSON.parse(mock) as {
        passed?: boolean;
        confidenceScore?: number;
      };
      return {
        passed: payload.passed === true,
        ...(payload.confidenceScore !== undefined
          ? { confidenceScore: payload.confidenceScore }
          : {}),
        reason: payload.passed === true ? 'passed' : 'failed',
      };
    }

    if (!evidence?.sessionId) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    if (!region || !accessKeyId || !secretAccessKey) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    try {
      const payload = (await postAwsJson(
        region,
        accessKeyId,
        secretAccessKey,
        'RekognitionService.GetFaceLivenessSessionResults',
        { SessionId: evidence.sessionId },
      )) as { Status?: string; Confidence?: number };

      const minConfidence =
        this.configService.get<number>('AWS_REKOGNITION_LIVENESS_MIN_CONFIDENCE') ?? 90;
      const confidence = payload.Confidence;
      const passed =
        payload.Status === 'SUCCEEDED' &&
        typeof confidence === 'number' &&
        confidence >= minConfidence;

      return {
        passed,
        ...(typeof confidence === 'number' ? { confidenceScore: confidence } : {}),
        reason: passed ? 'passed' : 'failed',
      };
    } catch {
      return { passed: false, reason: 'provider_error' };
    }
  }

  private evaluateMockProvider(
    envKey: string,
    evidence?: LivenessCheckInput['evidence'],
  ): { passed: boolean; confidenceScore?: number; reason?: string } {
    const mock = this.configService.get<string>(envKey);
    if (mock) {
      const payload = JSON.parse(mock) as {
        passed?: boolean;
        confidenceScore?: number;
      };
      return {
        passed: payload.passed === true,
        ...(payload.confidenceScore !== undefined
          ? { confidenceScore: payload.confidenceScore }
          : {}),
        reason: payload.passed === true ? 'passed' : 'failed',
      };
    }

    return this.evaluateInlineEvidence(evidence);
  }

  private evaluateInlineEvidence(evidence?: LivenessCheckInput['evidence']): {
    passed: boolean;
    confidenceScore?: number;
    reason?: string;
  } {
    if (evidence?.passed === true) {
      return {
        passed: true,
        ...(evidence.confidenceScore !== undefined
          ? { confidenceScore: evidence.confidenceScore }
          : {}),
        reason: 'passed',
      };
    }

    if (evidence?.passed === false) {
      return {
        passed: false,
        ...(evidence.confidenceScore !== undefined
          ? { confidenceScore: evidence.confidenceScore }
          : {}),
        reason: 'failed',
      };
    }

    return { passed: false, reason: 'provider_unavailable' };
  }
}
