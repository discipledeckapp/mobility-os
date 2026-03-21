import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'tenant-web',
    timestamp: new Date().toISOString(),
  });
}
