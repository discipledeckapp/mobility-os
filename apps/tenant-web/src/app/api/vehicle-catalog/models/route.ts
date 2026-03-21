import { type NextRequest, NextResponse } from 'next/server';
import { createVehicleModel, listVehicleModels } from '../../../../lib/api-core';

export async function GET(request: NextRequest) {
  try {
    const makerId = request.nextUrl.searchParams.get('makerId') ?? undefined;
    const q = request.nextUrl.searchParams.get('q') ?? undefined;
    const vehicleType = request.nextUrl.searchParams.get('vehicleType') ?? undefined;

    const models = await listVehicleModels({
      ...(makerId ? { makerId } : {}),
      ...(q ? { q } : {}),
      ...(vehicleType ? { vehicleType } : {}),
    });
    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to load vehicle models.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      makerId?: string;
      name?: string;
      vehicleType?: string;
    };
    const model = await createVehicleModel({
      makerId: body.makerId?.trim() ?? '',
      name: body.name?.trim() ?? '',
      ...(body.vehicleType?.trim() ? { vehicleType: body.vehicleType.trim() } : {}),
    });
    return NextResponse.json(model, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to create vehicle model.',
      },
      { status: 500 },
    );
  }
}
