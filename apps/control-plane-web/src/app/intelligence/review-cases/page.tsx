import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import { listReviewCases } from '../../../lib/api-intelligence';
import { ReviewCasesPanel } from './review-cases-panel';

export default async function IntelligenceReviewCasesPage() {
  const reviewCases = await listReviewCases().catch(() => []);

  return (
    <ControlPlaneShell
      description="Adjudicate identity collisions, duplicate signals, and fraud reviews from the intelligence plane."
      eyebrow="Intelligence operations"
      title="Review cases"
    >
      <ReviewCasesPanel reviewCases={reviewCases} />
    </ControlPlaneShell>
  );
}
