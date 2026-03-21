import { NextResponse } from 'next/server';
import { getVehicleCodeSuggestion } from '../../../../lib/api-core';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fleetId = searchParams.get('fleetId')?.trim() ?? '';

  if (!fleetId) {
    return NextResponse.json({ message: 'fleetId is required.' }, { status: 400 });
  }

  try {
    const suggestion = await getVehicleCodeSuggestion(fleetId);
    return NextResponse.json(suggestion, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Unable to generate a vehicle code suggestion.',
      },
      { status: 400 },
    );
  }
}
