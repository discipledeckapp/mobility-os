import 'dotenv/config';
import {
  isPlaceholderCredential,
  requestProviderJson,
  sanitizeProviderPayload,
  summarizeProviderFailure,
} from '../providers/provider-http';

type DiagnosticOperation = 'liveness-init' | 'nin-lookup';

function parseArgs() {
  const args = process.argv.slice(2);
  const operation = (args[0] as DiagnosticOperation | undefined) ?? 'liveness-init';
  const ninArg = args.find((arg) => arg.startsWith('--nin='));
  return {
    operation,
    nin: ninArg ? ninArg.slice('--nin='.length) : '12345678901',
  };
}

async function run() {
  const { operation, nin } = parseArgs();
  const baseUrl = process.env.YOUVERIFY_BASE_URL;
  const apiKey = process.env.YOUVERIFY_API_KEY;

  if (!baseUrl || !apiKey) {
    console.error(
      JSON.stringify({
        ok: false,
        reason: 'missing_config',
        requiredEnv: ['YOUVERIFY_BASE_URL', 'YOUVERIFY_API_KEY'],
      }),
    );
    process.exit(1);
  }

  const placeholder = isPlaceholderCredential(apiKey);

  const request =
    operation === 'nin-lookup'
      ? {
          operation,
          method: 'POST' as const,
          url: `${baseUrl.replace(/\/$/, '')}/v2/api/identity/ng/nin`,
          body: {
            id: nin,
            isSubjectConsent: true,
          },
        }
      : {
          operation,
          method: 'POST' as const,
          url: `${baseUrl.replace(/\/$/, '')}/v2/api/identity/sdk/liveness/session/generate`,
          body: {
            ttlSeconds: 120,
            metadata: {
              tenantId: 'diagnostic_tenant',
              countryCode: 'NG',
            },
          },
        };

  const response = await requestProviderJson({
    providerName: 'youverify',
    operation: request.operation,
    method: request.method,
    url: request.url,
    headers: { token: apiKey },
    body: request.body,
  });

  const failure = summarizeProviderFailure('youverify', request.operation, response);
  console.log(
    JSON.stringify(
      {
        ok: !failure,
        provider: 'youverify',
        operation: request.operation,
        placeholderCredential: placeholder,
        method: request.method,
        url: request.url,
        authHeader: 'token',
        statusCode: response.statusCode,
        failure: failure ?? null,
        body: sanitizeProviderPayload(response.payload),
      },
      null,
      2,
    ),
  );

  if (failure) {
    process.exit(1);
  }
}

void run().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        provider: 'youverify',
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
