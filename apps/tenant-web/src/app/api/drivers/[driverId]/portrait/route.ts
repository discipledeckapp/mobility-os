import type { NextRequest } from 'next/server';
import { getTenantApiToken } from '../../../../../lib/api-core';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

// Legacy compatibility route: portrait now resolves through the unified selfie image pipeline.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ driverId: string }> },
) {
  const { driverId } = await context.params;
  const token = await getTenantApiToken();

  const response = await fetch(`${apiBaseUrl}/drivers/${driverId}/identity-image/selfie`, {
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return new Response(null, { status: response.status });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'image/jpeg',
      'content-disposition': 'inline',
      'cache-control': 'private, max-age=3600',
    },
  });
}
