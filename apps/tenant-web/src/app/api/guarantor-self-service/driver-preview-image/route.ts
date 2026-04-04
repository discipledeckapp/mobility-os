import type { NextRequest } from 'next/server';
import { issueGuarantorSelfServiceContinuationToken } from '../../../../lib/api-core';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

async function fetchPreviewImage(token: string): Promise<Response> {
  return fetch(
    `${apiBaseUrl}/guarantor-self-service/driver-preview-image?token=${encodeURIComponent(token)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  let response = token ? await fetchPreviewImage(token) : new Response(null, { status: 401 });

  if (response.status === 401) {
    try {
      const { token: refreshedToken } = await issueGuarantorSelfServiceContinuationToken();
      response = await fetchPreviewImage(refreshedToken);
    } catch {
      // Keep the original 401 when authenticated continuation is unavailable.
    }
  }

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
