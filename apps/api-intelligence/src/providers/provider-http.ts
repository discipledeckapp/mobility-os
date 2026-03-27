import { Logger } from '@nestjs/common';

const logger = new Logger('ProviderHttp');
const DEFAULT_TIMEOUT_MS = 15_000;

export interface ProviderJsonRequestInput {
  providerName: string;
  operation: string;
  method: 'GET' | 'POST';
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  timeoutMs?: number;
}

export interface ProviderJsonResponse {
  statusCode: number;
  payload: unknown | null;
  rawBody: string;
  contentType: string | null;
  parseError?: string;
}

function maskSecret(value: string): string {
  if (value.length <= 8) {
    return '***';
  }
  return `${value.slice(0, 4)}…${value.slice(-2)}`;
}

function sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      /token|authorization|api[-_]key/i.test(key) ? maskSecret(value) : value,
    ]),
  );
}

function logStructured(level: 'log' | 'warn' | 'error', payload: Record<string, unknown>) {
  logger[level](JSON.stringify(payload));
}

export function isPlaceholderCredential(value?: string | null): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim();
  return (
    normalized.length === 0 ||
    /^YOUR_[A-Z0-9_]+$/i.test(normalized) ||
    /^replace-with-/i.test(normalized) ||
    /^changeme$/i.test(normalized)
  );
}

export function summarizeProviderFailure(
  providerName: string,
  operation: string,
  response: ProviderJsonResponse,
): string | null {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    if (!response.rawBody.trim()) {
      return `${providerName} returned an empty response body for ${operation}`;
    }
    if (response.parseError) {
      return `${providerName} returned invalid JSON for ${operation}`;
    }
    return null;
  }

  if (response.statusCode === 401 || response.statusCode === 403) {
    return `${providerName} authentication failed for ${operation} (${response.statusCode})`;
  }

  if (response.statusCode === 404) {
    return `${providerName} endpoint was not found for ${operation} (404)`;
  }

  if (response.statusCode >= 500) {
    return `${providerName} returned a server error for ${operation} (${response.statusCode})`;
  }

  return `${providerName} returned status ${response.statusCode} for ${operation}`;
}

export function sanitizeProviderPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.slice(0, 5).map((entry) => sanitizeProviderPayload(entry));
  }

  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && value.length > 240) {
      return `${value.slice(0, 237)}...`;
    }
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([key, nested]) => {
    if (/image|photo|selfie|portrait|token|authorization|api[-_]key|signature/i.test(key)) {
      if (typeof nested === 'string' && nested.length > 0) {
        return [key, maskSecret(nested)];
      }
      return [key, '[Redacted]'];
    }
    return [key, sanitizeProviderPayload(nested)];
  });

  return Object.fromEntries(entries);
}

export async function requestProviderJson(
  input: ProviderJsonRequestInput,
): Promise<ProviderJsonResponse> {
  const controller = new AbortController();
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const requestHeaders = input.headers ?? {};
  const body = input.body ? JSON.stringify(input.body) : undefined;

  logStructured('log', {
    event: 'provider_request_started',
    provider: input.providerName,
    operation: input.operation,
    method: input.method,
    url: input.url,
    headers: sanitizeHeaders(requestHeaders),
    timeoutMs,
  });

  try {
    const response = await fetch(input.url, {
      method: input.method,
      headers: {
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...requestHeaders,
      },
      ...(body ? { body } : {}),
      signal: controller.signal,
    });

    const rawBody = await response.text().catch(() => '');
    const contentType = response.headers.get('content-type');
    let payload: unknown | null = null;
    let parseError: string | undefined;

    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody) as unknown;
      } catch (error) {
        parseError = error instanceof Error ? error.message : 'invalid_json';
        logStructured('warn', {
          event: 'provider_response_parse_failed',
          provider: input.providerName,
          operation: input.operation,
          statusCode: response.status,
          contentType,
          parseError,
          bodyPreview: rawBody.slice(0, 200),
        });
      }
    }

    logStructured('log', {
      event: 'provider_response_received',
      provider: input.providerName,
      operation: input.operation,
      statusCode: response.status,
      contentType,
      hasBody: rawBody.trim().length > 0,
      parseError: parseError ?? null,
      body: sanitizeProviderPayload(payload),
    });

    return {
      statusCode: response.status,
      payload,
      rawBody,
      contentType,
      ...(parseError ? { parseError } : {}),
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === 'AbortError'
          ? `request timed out after ${timeoutMs}ms`
          : error.message
        : 'request failed unexpectedly';

    logStructured('error', {
      event: 'provider_request_failed',
      provider: input.providerName,
      operation: input.operation,
      message,
    });
    throw new Error(`${input.providerName} request failed for ${input.operation}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}
