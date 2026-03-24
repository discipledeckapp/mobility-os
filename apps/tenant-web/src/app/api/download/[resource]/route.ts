import type { NextRequest } from 'next/server';
import { getTenantApiToken } from '../../../../lib/api-core';

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api/v1';

const RESOURCE_MAP: Record<string, { path: string; filename: string }> = {
  'driver-import-template': {
    path: '/drivers/import-template.csv',
    filename: 'driver-import-template.csv',
  },
  'drivers-export': {
    path: '/drivers/export.csv',
    filename: 'drivers.csv',
  },
  'vehicle-import-template': {
    path: '/vehicles/import-template.csv',
    filename: 'vehicle-import-template.csv',
  },
  'vehicles-export': {
    path: '/vehicles/export.csv',
    filename: 'vehicles.csv',
  },
  'assignment-import-template': {
    path: '/assignments/import-template.csv',
    filename: 'assignment-import-template.csv',
  },
  'assignments-export': {
    path: '/assignments/export.csv',
    filename: 'assignments.csv',
  },
  'remittance-export': {
    path: '/remittance/export.csv',
    filename: 'remittance-history.csv',
  },
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ resource: string }> },
) {
  const { resource } = await context.params;
  const match = RESOURCE_MAP[resource];

  if (!match) {
    return new Response('Download resource not found.', { status: 404 });
  }

  const response = await fetch(`${apiBaseUrl}${match.path}`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${await getTenantApiToken()}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return new Response('Unable to generate the requested CSV download.', {
      status: response.status,
    });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') ?? 'text/csv; charset=utf-8',
      'content-disposition':
        response.headers.get('content-disposition') ??
        `attachment; filename="${match.filename}"`,
    },
  });
}
