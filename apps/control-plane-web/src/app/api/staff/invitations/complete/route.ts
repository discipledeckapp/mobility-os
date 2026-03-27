import { NextRequest, NextResponse } from 'next/server';
import { completeStaffInvitation } from '../../../../../lib/api-control-plane';

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { token?: string; password?: string }
    | null;

  const token = body?.token?.trim();
  const password = body?.password ?? '';

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Invitation token and password are required.' },
      { status: 400 },
    );
  }

  try {
    const result = await completeStaffInvitation({ token, password });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to complete invitation.',
      },
      { status: 400 },
    );
  }
}
