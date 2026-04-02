import { RouteLoadingState } from '../../features/shared/route-state';

export default function WalletLoading() {
  return (
    <RouteLoadingState
      description="Redirecting you to the current verification credit page."
      eyebrow="Verification Credit"
      summaryCount={3}
      tableRows={3}
      title="Verification Credit"
    />
  );
}
