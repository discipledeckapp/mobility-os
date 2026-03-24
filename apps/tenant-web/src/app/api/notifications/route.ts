import { NextResponse } from 'next/server';
import { listUserNotifications } from '../../../lib/api-core';

export async function GET() {
  try {
    const notifications = await listUserNotifications();
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to load notifications.',
      },
      { status: 500 },
    );
  }
}
