'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function AuditError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review recent operational actions, actor history, and traceable workflow changes."
      eyebrow="Governance"
      error={error}
      heading="Unable to load audit history"
      reset={reset}
      title="Audit"
    />
  );
}
