import { type NextRequest, NextResponse } from 'next/server';
import { createVehicleMaker, listVehicleMakers } from '../../../../lib/api-core';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q') ?? undefined;
    const makers = await listVehicleMakers(undefined, q);
    return NextResponse.json(makers);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to load vehicle makers.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string };
    const maker = await createVehicleMaker({
      name: body.name?.trim() ?? '',
    });
    return NextResponse.json(maker, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to create vehicle maker.',
      },
      { status: 500 },
    );
  }
}
