import { type NextRequest, NextResponse } from 'next/server';
import { type DecodeVehicleVinInput, decodeVehicleVin } from '../../../../lib/api-core';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      vin?: string;
      modelYear?: number | string;
    };

    const normalizedYear =
      typeof body.modelYear === 'number'
        ? body.modelYear
        : typeof body.modelYear === 'string' && body.modelYear.trim()
          ? Number(body.modelYear)
          : undefined;

    const input: DecodeVehicleVinInput = { vin: body.vin?.trim() ?? '' };
    if (Number.isInteger(normalizedYear)) {
      input.modelYear = normalizedYear as number;
    }
    const decoded = await decodeVehicleVin(input);
    return NextResponse.json(decoded, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to decode VIN.',
      },
      { status: 500 },
    );
  }
}
