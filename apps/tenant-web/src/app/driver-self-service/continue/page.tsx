import { redirect } from 'next/navigation';
import { issueDriverSelfServiceContinuationToken } from '../../../lib/api-core';

export default async function DriverSelfServiceContinuePage() {
  const { token } = await issueDriverSelfServiceContinuationToken();
  redirect(`/driver-self-service?token=${encodeURIComponent(token)}`);
}
