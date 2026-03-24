import { NextResponse } from 'next/server';
import { listAssignments, listDrivers, listFleets, listVehicles } from '../../../lib/api-core';

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: 'driver' | 'vehicle' | 'fleet' | 'assignment';
};

function includesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return NextResponse.json([] satisfies SearchItem[]);
  }

  try {
    const [drivers, vehicles, fleets, assignments] = await Promise.all([
      listDrivers({ q, limit: 8 }),
      listVehicles({ limit: 80 }),
      listFleets(),
      listAssignments({ limit: 40 }),
    ]);

    const vehicleResults = vehicles.data
      .filter((vehicle) =>
        [
          vehicle.tenantVehicleCode,
          vehicle.systemVehicleCode,
          vehicle.plate ?? '',
          `${vehicle.make} ${vehicle.model}`,
        ].some((value) => includesQuery(value, q)),
      )
      .slice(0, 8)
      .map<SearchItem>((vehicle) => ({
        id: vehicle.id,
        title: vehicle.tenantVehicleCode || vehicle.systemVehicleCode,
        subtitle: `${vehicle.make} ${vehicle.model}${vehicle.plate ? ` · ${vehicle.plate}` : ''}`,
        href: `/vehicles/${vehicle.id}`,
        type: 'vehicle',
      }));

    const fleetResults = fleets
      .filter((fleet) =>
        [fleet.name, fleet.businessModel, fleet.status].some((value) => includesQuery(value, q)),
      )
      .slice(0, 8)
      .map<SearchItem>((fleet) => ({
        id: fleet.id,
        title: fleet.name,
        subtitle: `${fleet.businessModel} · ${fleet.status}`,
        href: `/fleets?fleetId=${encodeURIComponent(fleet.id)}`,
        type: 'fleet',
      }));

    const assignmentResults = assignments.data
      .filter((assignment) =>
        [assignment.id, assignment.status, assignment.driverId, assignment.vehicleId].some(
          (value) => includesQuery(value, q),
        ),
      )
      .slice(0, 8)
      .map<SearchItem>((assignment) => ({
        id: assignment.id,
        title: `Assignment ${assignment.id.slice(0, 8)}`,
        subtitle: `${assignment.driverId} · ${assignment.vehicleId} · ${assignment.status}`,
        href: `/assignments/${assignment.id}`,
        type: 'assignment',
      }));

    const driverResults = drivers.data.map<SearchItem>((driver) => ({
      id: driver.id,
      title: `${driver.firstName} ${driver.lastName}`.trim(),
      subtitle: `${driver.status} · ${driver.phone}`,
      href: `/drivers/${driver.id}`,
      type: 'driver',
    }));

    return NextResponse.json([
      ...driverResults,
      ...vehicleResults,
      ...fleetResults,
      ...assignmentResults,
    ]);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to search right now.',
      },
      { status: 500 },
    );
  }
}
