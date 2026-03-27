import { getPlatformApiToken } from '../../../../../../lib/api-control-plane';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_CONTROL_PLANE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3100/api';

export async function GET(
  _request: Request,
  context: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await context.params;

  const response = await fetch(`${apiBaseUrl}/records/documents/${documentId}/content`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${await getPlatformApiToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return new Response('Unable to load the requested platform document.', {
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
