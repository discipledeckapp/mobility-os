import { RouteLoadingState } from '../../features/shared/route-state';

export default function AuditLoading() {
  return (
    <RouteLoadingState
      description="Loading recent operational events, actor history, and workflow-linked audit activity."
      eyebrow="Governance"
      summaryCount={4}
      tableRows={8}
      title="Audit"
    />
  );
}
