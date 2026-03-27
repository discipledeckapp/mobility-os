import type { NextRequest } from 'next/server';
import { getTenantApiToken } from '../../../../../../lib/api-core';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;

  const response = await fetch(`${apiBaseUrl}/records/documents/${documentId}/content`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${await getTenantApiToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return new Response('Unable to load the requested record document.', {
      status: response.status,
    });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'application/octet-stream',
      'content-disposition': response.headers.get('content-disposition') ?? 'attachment',
    },
  });
}
