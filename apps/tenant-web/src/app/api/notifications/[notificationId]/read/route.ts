import { NextResponse } from 'next/server';
import { markUserNotificationRead } from '../../../../../lib/api-core';

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { notificationId } = await context.params;
    const notification = await markUserNotificationRead(notificationId);
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to mark notification as read.',
      },
      { status: 500 },
    );
  }
}
