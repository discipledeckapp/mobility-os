import type { NextRequest } from 'next/server';
import { getTenantApiToken } from '../../../../../../../lib/api-core';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ driverId: string; documentId: string }> },
) {
  const { driverId, documentId } = await context.params;
  const token = request.nextUrl.searchParams.get('token');

  const upstreamUrl = token
    ? `${apiBaseUrl}/driver-self-service/documents/${documentId}/content?token=${encodeURIComponent(token)}`
    : `${apiBaseUrl}/drivers/${driverId}/documents/${documentId}/content`;

  const headers = new Headers();
  if (!token) {
    headers.set('authorization', `Bearer ${await getTenantApiToken()}`);
  }

  const response = await fetch(upstreamUrl, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    return new Response('Unable to load the document preview.', {
      status: response.status,
    });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/octet-stream',
      'content-disposition': response.headers.get('content-disposition') ?? 'inline',
    },
  });
}
