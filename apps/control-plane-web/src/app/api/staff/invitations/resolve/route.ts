import { NextRequest, NextResponse } from 'next/server';
import { resolveStaffInvitation } from '../../../../../lib/api-control-plane';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.json({ error: 'Invitation token is required.' }, { status: 400 });
  }

  try {
    const invitation = await resolveStaffInvitation(token);
    return NextResponse.json(invitation);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to resolve invitation.',
      },
      { status: 400 },
    );
  }
}
