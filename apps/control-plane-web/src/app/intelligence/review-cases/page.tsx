import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import {
  ControlPlaneHeroPanel,
  ControlPlaneMetricCard,
  ControlPlaneMetricGrid,
} from '../../../features/shared/control-plane-page-patterns';
import { listReviewCases } from '../../../lib/api-intelligence';
import { ReviewCasesPanel } from './review-cases-panel';

export default async function IntelligenceReviewCasesPage() {
  const reviewCases = await listReviewCases().catch(() => []);
  const openCases = reviewCases.filter((item) => item.status !== 'resolved').length;
  const highConfidence = reviewCases.filter((item) => item.confidenceScore >= 0.8).length;
  const unresolved = reviewCases.filter((item) => !item.resolution).length;

  return (
    <ControlPlaneShell
      description="Adjudicate identity collisions, duplicate signals, and fraud reviews from the intelligence plane."
      eyebrow="Intelligence operations"
      title="Review cases"
    >
      <div className="space-y-6">
        <ControlPlaneHeroPanel
          badges={[
            { label: `${openCases} open`, tone: openCases ? 'warning' : 'success' },
            { label: `${highConfidence} high confidence`, tone: highConfidence ? 'warning' : 'neutral' },
            { label: `${unresolved} unresolved`, tone: unresolved ? 'warning' : 'success' },
          ]}
          description="This is the platform adjudication queue for duplicate identity, fraud, and manual merge-or-separate decisions across tenants."
          eyebrow="Manual intelligence adjudication"
          title="Resolve the person-linking and fraud cases that need human review."
        />
        <ControlPlaneMetricGrid columns={3}>
          <ControlPlaneMetricCard label="Tracked review cases" value={reviewCases.length} />
          <ControlPlaneMetricCard label="Open cases" tone={openCases ? 'warning' : 'success'} value={openCases} />
          <ControlPlaneMetricCard label="High-confidence collisions" tone={highConfidence ? 'warning' : 'neutral'} value={highConfidence} />
        </ControlPlaneMetricGrid>
        <ReviewCasesPanel reviewCases={reviewCases} />
      </div>
    </ControlPlaneShell>
  );
}
