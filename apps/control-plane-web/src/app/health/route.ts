import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'control-plane-web',
    timestamp: new Date().toISOString(),
  });
}
