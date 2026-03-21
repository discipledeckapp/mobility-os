import { RouteLoadingState } from '../../features/shared/route-state';

export default function SettingsLoading() {
  return (
    <RouteLoadingState
      description="Manage your operator profile, security credentials, and organisation reference details."
      eyebrow="Workspace"
      summaryCount={2}
      tableRows={4}
      title="Settings"
    />
  );
}
