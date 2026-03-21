'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import Link from 'next/link';
import { useState } from 'react';
import type { VehicleDetailRecord } from '../../../lib/api-core';
import { VehicleStatusActions } from '../vehicle-status-actions';
import { EditVehicleForm } from './edit-vehicle-form';

export function VehicleDetailActions({
  vehicle,
}: {
  vehicle: VehicleDetailRecord;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>Vehicle operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Text tone="muted">Status and maintenance</Text>
            <VehicleStatusActions vehicle={vehicle} />
          </div>

          <div className="space-y-2">
            <Text tone="muted">Valuation and commercial updates</Text>
            <Text tone="muted">
              Update valuation and secondary identifiers from the edit action below.
            </Text>
          </div>

          <div className="space-y-2">
            <Text tone="muted">Assignments</Text>
            <Text tone="muted">
              Manage assignment changes from the assignments workspace so vehicle pairing stays
              controlled.
            </Text>
            <Link href="/assignments">
              <Button size="sm" variant="ghost">
                Open assignments
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <Text tone="muted">Edit record</Text>
            <Button
              onClick={() => setIsEditing((current) => !current)}
              size="sm"
              type="button"
              variant={isEditing ? 'secondary' : 'ghost'}
            >
              <span className="mr-2 inline-flex" aria-hidden="true">
                <svg
                  aria-hidden="true"
                  fill="none"
                  focusable="false"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path d="M2 11.5V14h2.5L12.8 5.7 10.3 3.2 2 11.5z" />
                  <path d="M9.6 3.9l2.5 2.5" />
                </svg>
              </span>
              {isEditing ? 'Close vehicle editor' : 'Edit vehicle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditing ? <EditVehicleForm vehicle={vehicle} /> : null}
    </div>
  );
}
