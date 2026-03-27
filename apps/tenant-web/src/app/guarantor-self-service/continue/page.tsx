import { redirect } from 'next/navigation';
import { issueGuarantorSelfServiceContinuationToken } from '../../../lib/api-core';

export default async function GuarantorSelfServiceContinuePage() {
  const { token } = await issueGuarantorSelfServiceContinuationToken();
  redirect(`/guarantor-self-service?token=${encodeURIComponent(token)}`);
}
