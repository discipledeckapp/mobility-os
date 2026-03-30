'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function RecordsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Review operational documents, disputes, and audit history."
      eyebrow="Operations"
      error={error}
      heading="Unable to load records"
      reset={reset}
      title="Records"
    />
  );
}
