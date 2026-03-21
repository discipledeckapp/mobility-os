'use client';

import { RouteErrorState } from '../../features/shared/route-state';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteErrorState
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      error={error}
      heading="Unable to load settings"
      reset={reset}
      title="Settings"
    />
  );
}
