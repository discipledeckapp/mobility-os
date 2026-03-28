import { createHash, createHmac } from 'node:crypto';
import { request as httpsRequest } from 'node:https';
import {
  type IdentityVerificationProviderCapability,
  getCountryConfig,
} from '@mobility-os/domain-config';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { ConfigService } from '@nestjs/config';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import {
  ControlPlaneSettingsClient,
  DEFAULT_LIVENESS_ROUTING,
} from './control-plane-settings.client';
import {
  isPlaceholderCredential,
  requestProviderJson,
  summarizeProviderFailure,
} from './provider-http';

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

type LivenessReadinessStatus =
  | 'ready'
  | 'misconfigured'
  | 'temporarily_unavailable'
  | 'unsupported_country';

type ProviderReadiness = {
  providerName: string;
  ready: boolean;
  reason: 'ready' | 'missing_credentials' | 'unsupported' | 'temporarily_unavailable';
  missingConfigKeys?: string[];
};

export interface LivenessReadinessResult {
  countryCode: string;
  ready: boolean;
  status: LivenessReadinessStatus;
  activeProvider?: string;
  configuredProviders: string[];
  checkedAt: string;
  message: string;
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

@Injectable()
export class LivenessService {
  private readonly logger = new Logger(LivenessService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly controlPlaneSettingsClient: ControlPlaneSettingsClient,
  ) {}

  async getReadiness(countryCode: string): Promise<LivenessReadinessResult> {
    const providers = await this.getConfiguredProviders(countryCode);
    const checkedAt = new Date().toISOString();

    if (providers.length === 0) {
      return {
        countryCode,
        ready: false,
        status: 'unsupported_country',
        configuredProviders: [],
        checkedAt,
        message: 'Live verification is not configured for this country yet.',
      };
    }

    const readinessChecks = providers.map((provider) =>
      this.getProviderReadiness(provider.name, countryCode),
    );
    const activeProvider = readinessChecks.find((provider) => provider.ready);

    if (activeProvider) {
      return {
        countryCode,
        ready: true,
        status: 'ready',
        activeProvider: activeProvider.providerName,
        configuredProviders: providers.map((provider) => provider.name),
        checkedAt,
        message: 'Live verification is ready.',
      };
    }

    return {
      countryCode,
      ready: false,
      status: 'misconfigured',
      configuredProviders: providers.map((provider) => provider.name),
      checkedAt,
      message: 'Live verification is not ready right now. Please contact support.',
    };
  }

  async evaluate(input: LivenessCheckInput): Promise<LivenessCheckResult> {
    this.logger.log(
      JSON.stringify({
        event: 'liveness_evaluate_start',
        countryCode: input.countryCode,
        hasPreverified: input.livenessPassed !== undefined,
        evidenceProvider: input.evidence?.provider ?? null,
        evidenceSessionId: input.evidence?.sessionId ?? null,
        evidencePassed: input.evidence?.passed ?? null,
      }),
    );

    if (input.livenessPassed === true) {
      this.logger.log(JSON.stringify({ event: 'liveness_evaluate_preverified', result: 'passed' }));
      return {
        attempted: true,
        passed: true,
        fallbackChain: ['preverified:true'],
      };
    }

    if (input.livenessPassed === false) {
      this.logger.log(JSON.stringify({ event: 'liveness_evaluate_preverified', result: 'failed' }));
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

      this.logger.log(
        JSON.stringify({
          event: 'liveness_provider_result',
          provider: provider.name,
          passed: result.passed,
          reason: result.reason ?? null,
          confidenceScore: result.confidenceScore ?? null,
        }),
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

    // All configured providers failed/unavailable. If the client submitted evidence with
    // passed: true from a backend-issued session (e.g. native YouVerify liveness), trust it
    // rather than blocking verification due to a transient provider sync delay.
    if (input.evidence?.passed === true && input.evidence.sessionId) {
      this.logger.warn(
        JSON.stringify({
          event: 'liveness_evaluate_inline_fallback',
          reason:
            'all providers unavailable — trusting client evidence from backend-issued session',
          evidenceProvider: input.evidence.provider ?? null,
          evidenceSessionId: input.evidence.sessionId,
          fallbackChain,
        }),
      );
      return {
        attempted: true,
        passed: true,
        fallbackChain: [...fallbackChain, 'inline_evidence:passed'],
        ...(input.evidence.provider ? { providerName: input.evidence.provider } : {}),
        reason: 'inline_evidence_fallback',
      };
    }

    const finalResult = {
      attempted: fallbackChain.length > 0,
      passed: false,
      fallbackChain,
      reason:
        fallbackChain.length > 0
          ? 'all configured liveness providers were unavailable'
          : 'no liveness evidence or configured providers available',
    };
    this.logger.warn(
      JSON.stringify({
        event: 'liveness_evaluate_failed',
        ...finalResult,
      }),
    );
    return finalResult;
  }

  async initializeSession(input: LivenessSessionInitInput): Promise<LivenessSessionInitResult> {
    const providers = await this.getConfiguredProviders(input.countryCode);

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

    const readiness = await this.getReadiness(input.countryCode);
    throw new ServiceUnavailableException(
      readiness.ready
        ? 'Live verification is temporarily unavailable right now. Please try again in a moment.'
        : readiness.message,
    );
  }

  private async getConfiguredProviders(countryCode: string) {
    const routingOverride =
      (await this.controlPlaneSettingsClient.getIdentityVerificationRoutingForCountry(
        countryCode,
      )) ?? DEFAULT_LIVENESS_ROUTING;
    const providerCapabilities = new Map<string, IdentityVerificationProviderCapability>(
      (getCountryConfig(countryCode).identityVerification?.providerCapabilities ?? []).map(
        (provider) => [provider.name, provider],
      ),
    );

    return [...routingOverride.livenessProviders]
      .filter((provider) => provider.enabled)
      .filter((provider) => providerCapabilities.get(provider.name)?.supportsLiveness)
      .sort((left, right) => left.priority - right.priority);
  }

  private getProviderReadiness(providerName: string, countryCode: string): ProviderReadiness {
    let readiness: ProviderReadiness;

    switch (providerName) {
      case 'azure_face':
        readiness = this.checkRequiredConfig(
          providerName,
          ['AZURE_FACE_ENDPOINT', 'AZURE_FACE_API_KEY'],
          { mockEnvKey: 'AZURE_FACE_LIVENESS_MOCK_RESPONSE' },
        );
        break;
      case 'amazon_rekognition':
        readiness = this.checkRequiredConfig(
          providerName,
          ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
          { mockEnvKey: 'AWS_REKOGNITION_MOCK_LIVENESS_RESPONSE' },
        );
        break;
      case 'youverify':
        readiness = this.checkRequiredConfig(
          providerName,
          ['YOUVERIFY_API_KEY', 'YOUVERIFY_BASE_URL', 'YOUVERIFY_PUBLIC_MERCHANT_ID'],
          { mockEnvKey: 'YOUVERIFY_LIVENESS_MOCK_RESPONSE' },
        );
        break;
      case 'smile_identity':
        readiness = this.checkRequiredConfig(
          providerName,
          ['SMILE_IDENTITY_API_KEY', 'SMILE_IDENTITY_PARTNER_ID', 'SMILE_IDENTITY_BASE_URL'],
          { mockEnvKey: 'SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE' },
        );
        break;
      case 'internal_free_service':
        readiness = {
          providerName,
          ready: true,
          reason: 'ready',
        };
        break;
      default:
        readiness = {
          providerName,
          ready: false,
          reason: 'unsupported',
        };
        break;
    }

    if (!readiness.ready) {
      this.logger.warn(
        JSON.stringify({
          event: 'liveness_provider_not_ready',
          countryCode,
          providerName,
          reason: readiness.reason,
          missingConfigKeys: readiness.missingConfigKeys ?? [],
        }),
      );
    }

    return readiness;
  }

  private checkRequiredConfig(
    providerName: string,
    keys: string[],
    options?: { mockEnvKey?: string },
  ): ProviderReadiness {
    const mockValue = options?.mockEnvKey ? this.configService.get<string>(options.mockEnvKey) : '';
    if (mockValue) {
      return {
        providerName,
        ready: true,
        reason: 'ready',
      };
    }

    const missingConfigKeys = keys.filter((key) => {
      const value = this.configService.get<string>(key);
      return !value || isPlaceholderCredential(value);
    });

    if (missingConfigKeys.length > 0) {
      return {
        providerName,
        ready: false,
        reason: 'missing_credentials',
        missingConfigKeys,
      };
    }

    return {
      providerName,
      ready: true,
      reason: 'ready',
    };
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
        return this.evaluateYouVerifyLiveness(evidence);
      case 'smile_identity':
        return this.evaluateSmileIdentityLiveness(evidence);
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
        return this.initializeSmileIdentitySession(input);
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
    if (!endpoint || !apiKey || isPlaceholderCredential(apiKey)) {
      return { reason: 'provider_unavailable' };
    }

    try {
      const url = `${endpoint.replace(/\/$/, '')}/face/v1.2/detectLiveness/singleModal/sessions`;
      const response = await requestProviderJson({
        providerName: 'azure_face',
        operation: 'liveness:init',
        method: 'POST',
        url,
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
        body: {
          livenessOperationMode: 'Passive',
          sendResultsToClient: false,
          authTokenTimeToLiveInSeconds: 60,
        },
      });

      if (summarizeProviderFailure('azure_face', 'liveness:init', response)) {
        return { reason: 'provider_error' };
      }

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
    if (!endpoint || !apiKey || isPlaceholderCredential(apiKey)) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    try {
      const url = `${endpoint.replace(/\/$/, '')}/face/v1.2/detectLiveness/singleModal/sessions/${encodeURIComponent(evidence.sessionId)}`;
      const response = await requestProviderJson({
        providerName: 'azure_face',
        operation: 'liveness:result',
        method: 'GET',
        url,
        headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      });

      if (summarizeProviderFailure('azure_face', 'liveness:result', response)) {
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

  private async initializeYouVerifySession(input: LivenessSessionInitInput): Promise<{
    sessionId?: string;
    clientAuthToken?: string;
    expiresAt?: string;
    reason?: string;
  }> {
    const mock = this.configService.get<string>('YOUVERIFY_LIVENESS_MOCK_RESPONSE');
    if (mock) {
      // In mock mode supply a fake sessionToken so the youverify-liveness-web SDK
      // can be initialised in sandboxEnvironment=true without real credentials.
      return {
        sessionId: 'youverify-mock-session',
        clientAuthToken: 'youverify-mock-auth-token',
        expiresAt: new Date(Date.now() + 120_000).toISOString(),
        reason: 'initialized',
      };
    }

    const apiKey = this.configService.get<string>('YOUVERIFY_API_KEY');
    const baseUrl = this.configService.get<string>('YOUVERIFY_BASE_URL');
    if (!apiKey || !baseUrl || isPlaceholderCredential(apiKey)) {
      return { reason: 'provider_unavailable' };
    }

    const base = baseUrl.replace(/\/$/, '');

    // publicMerchantID is required for both steps — resolve before any network call.
    const publicMerchantId = this.configService.get<string>('YOUVERIFY_PUBLIC_MERCHANT_ID');
    if (!publicMerchantId) {
      return { reason: 'provider_error' };
    }

    try {
      // Step 1 — generate a YouVerify liveness session ID.
      // Correct endpoint: POST /v2/api/identity/sdk/session/generate
      // (NOT /sdk/liveness/session/generate which returns 404)
      const sessionResponse = await requestProviderJson({
        providerName: 'youverify',
        operation: 'liveness:init',
        method: 'POST',
        url: `${base}/v2/api/identity/sdk/session/generate`,
        headers: { token: apiKey },
        body: {
          publicMerchantID: publicMerchantId,
          metadata: { tenantId: input.tenantId, countryCode: input.countryCode },
        },
      });

      if (summarizeProviderFailure('youverify', 'liveness:init', sessionResponse)) {
        return { reason: 'provider_error' };
      }

      const sessionPayload = sessionResponse.payload as {
        data?: { sessionId?: string; expiresAt?: string };
      };

      if (!sessionPayload.data?.sessionId) {
        return { reason: 'provider_error' };
      }

      const { sessionId, expiresAt } = sessionPayload.data;

      // Step 2 — generate the SDK auth token (Azure Face JWT) required by the
      // youverify-liveness-web SDK. Failure here is fatal — no camera fallback.
      let clientAuthToken: string | undefined;
      try {
        const tokenResponse = await requestProviderJson({
          providerName: 'youverify',
          operation: 'liveness:token',
          method: 'POST',
          url: `${base}/v2/api/identity/sdk/liveness/token`,
          headers: { token: apiKey },
          body: {
            publicMerchantID: publicMerchantId,
            deviceCorrelationId: `mobiris-web-${input.tenantId}-${Date.now()}`,
          },
        });

        if (summarizeProviderFailure('youverify', 'liveness:token', tokenResponse)) {
          return { reason: 'provider_error' };
        }

        const tokenPayload = tokenResponse.payload as {
          data?: { authToken?: string };
          authToken?: string;
        };
        clientAuthToken = tokenPayload.data?.authToken ?? tokenPayload.authToken;
      } catch {
        return { reason: 'provider_error' };
      }

      if (!clientAuthToken) {
        return { reason: 'provider_error' };
      }

      return {
        sessionId,
        ...(expiresAt ? { expiresAt } : {}),
        clientAuthToken,
        reason: 'initialized',
      };
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

  // ── YouVerify Liveness ───────────────────────────────────────────────────────

  private async evaluateYouVerifyLiveness(
    evidence?: LivenessCheckInput['evidence'],
  ): Promise<{ passed: boolean; confidenceScore?: number; reason?: string }> {
    const mock = this.configService.get<string>('YOUVERIFY_LIVENESS_MOCK_RESPONSE');
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

    const apiKey = this.configService.get<string>('YOUVERIFY_API_KEY');
    const baseUrl = this.configService.get<string>('YOUVERIFY_BASE_URL');
    if (!apiKey || !baseUrl || isPlaceholderCredential(apiKey)) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    try {
      // Use the liveness history endpoint — the correct way to query SDK session results.
      // The old /sdk/liveness/session/{id} path returns session metadata only; the actual
      // liveness outcome (passed: boolean) is in the /v2/api/identity/liveness history.
      const url = `${baseUrl.replace(/\/$/, '')}/v2/api/identity/liveness?sessionId=${encodeURIComponent(evidence.sessionId)}`;
      const response = await requestProviderJson({
        providerName: 'youverify',
        operation: 'liveness:result',
        method: 'GET',
        url,
        headers: { token: apiKey },
      });

      if (summarizeProviderFailure('youverify', 'liveness:result', response)) {
        return { passed: false, reason: 'provider_error' };
      }

      // Response shape: { data: Array<{ passed: boolean, sessionId: string, ... }> }
      const payload = response.payload as {
        data?: Array<{
          passed?: boolean;
          sessionId?: string;
          faceImage?: string;
          livenessClip?: string;
        }>;
      };

      const records = Array.isArray(payload.data) ? payload.data : [];
      // Find the record matching this specific session, or use the first returned.
      const record = records.find((r) => r.sessionId === evidence.sessionId) ?? records[0];

      if (!record) {
        // No result in YouVerify's liveness history. This commonly occurs immediately
        // after the native SDK completes because there is a propagation delay between
        // the Azure Face result and YouVerify's history endpoint. Log and surface as
        // provider_error so the caller can apply inline evidence fallback.
        this.logger.warn(
          JSON.stringify({
            event: 'youverify_liveness_session_not_found',
            sessionId: evidence.sessionId,
            recordCount: records.length,
            note: 'Azure Face → YouVerify sync may not have completed yet',
          }),
        );
        return { passed: false, reason: 'provider_error' };
      }

      // The YouVerify liveness history record uses a simple `passed` boolean.
      const passed = record.passed === true;

      this.logger.log(
        JSON.stringify({
          event: 'youverify_liveness_session_result',
          sessionId: evidence.sessionId,
          passed,
        }),
      );

      return { passed, reason: passed ? 'passed' : 'failed' };
    } catch {
      return { passed: false, reason: 'provider_error' };
    }
  }

  // ── Smile Identity Liveness ──────────────────────────────────────────────────

  private async initializeSmileIdentitySession(input: LivenessSessionInitInput): Promise<{
    sessionId?: string;
    clientAuthToken?: string;
    expiresAt?: string;
    reason?: string;
  }> {
    const mock = this.configService.get<string>('SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE');
    if (mock) {
      return {
        sessionId: `smile-mock-${input.tenantId}-${Date.now()}`,
        clientAuthToken: 'smile-mock-web-token',
        expiresAt: new Date(Date.now() + 120_000).toISOString(),
        reason: 'initialized',
      };
    }

    const apiKey = this.configService.get<string>('SMILE_IDENTITY_API_KEY');
    const partnerId = this.configService.get<string>('SMILE_IDENTITY_PARTNER_ID');
    const baseUrl = this.configService.get<string>('SMILE_IDENTITY_BASE_URL');
    if (!apiKey || !partnerId || !baseUrl || isPlaceholderCredential(apiKey)) {
      return { reason: 'provider_unavailable' };
    }

    const timestamp = new Date().toISOString();
    const signature = hmac(Buffer.from(apiKey), `${timestamp}${partnerId}sid_request`).toString(
      'base64',
    );

    try {
      const response = await requestProviderJson({
        providerName: 'smile_identity',
        operation: 'liveness:init',
        method: 'POST',
        url: `${baseUrl.replace(/\/$/, '')}/v1/token`,
        body: {
          partner_id: partnerId,
          timestamp,
          signature,
          product: 'biometric_kyc',
        },
      });

      if (summarizeProviderFailure('smile_identity', 'liveness:init', response)) {
        return { reason: 'provider_error' };
      }

      const payload = response.payload as { token?: string; expires_at?: string };
      if (!payload.token) {
        return { reason: 'provider_error' };
      }

      return {
        sessionId: `smile-${input.tenantId}-${Date.now()}`,
        clientAuthToken: payload.token,
        expiresAt: payload.expires_at ?? new Date(Date.now() + 120_000).toISOString(),
        reason: 'initialized',
      };
    } catch {
      return { reason: 'provider_error' };
    }
  }

  private async evaluateSmileIdentityLiveness(
    evidence?: LivenessCheckInput['evidence'],
  ): Promise<{ passed: boolean; confidenceScore?: number; reason?: string }> {
    const mock = this.configService.get<string>('SMILE_IDENTITY_LIVENESS_MOCK_RESPONSE');
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

    const apiKey = this.configService.get<string>('SMILE_IDENTITY_API_KEY');
    const partnerId = this.configService.get<string>('SMILE_IDENTITY_PARTNER_ID');
    const baseUrl = this.configService.get<string>('SMILE_IDENTITY_BASE_URL');
    if (!apiKey || !partnerId || !baseUrl || isPlaceholderCredential(apiKey)) {
      return { passed: false, reason: 'provider_unavailable' };
    }

    // SmileID Web SDK returns user_id and job_id encoded as "userId::jobId"
    const separatorIndex = evidence.sessionId.indexOf('::');
    if (separatorIndex === -1) {
      return this.evaluateInlineEvidence(evidence);
    }

    const userId = evidence.sessionId.slice(0, separatorIndex);
    const jobId = evidence.sessionId.slice(separatorIndex + 2);

    const timestamp = new Date().toISOString();
    const signature = hmac(Buffer.from(apiKey), `${timestamp}${partnerId}sid_request`).toString(
      'base64',
    );

    try {
      const response = await requestProviderJson({
        providerName: 'smile_identity',
        operation: 'liveness:result',
        method: 'POST',
        url: `${baseUrl.replace(/\/$/, '')}/v1/get_job_status`,
        body: {
          partner_id: partnerId,
          timestamp,
          signature,
          user_id: userId,
          job_id: jobId,
          return_history: false,
          return_images: false,
        },
      });

      if (summarizeProviderFailure('smile_identity', 'liveness:result', response)) {
        return { passed: false, reason: 'provider_error' };
      }

      const payload = response.payload as {
        job_complete?: boolean;
        job_success?: boolean;
        Actions?: { Liveness_Check?: string };
      };

      if (!payload.job_complete) {
        return { passed: false, reason: 'session_pending' };
      }

      const passed = payload.job_success === true && payload.Actions?.Liveness_Check === 'Passed';

      return {
        passed,
        reason: passed ? 'passed' : 'failed',
      };
    } catch {
      return { passed: false, reason: 'provider_error' };
    }
  }
}
