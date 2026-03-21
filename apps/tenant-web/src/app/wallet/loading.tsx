import { RouteLoadingState } from '../../features/shared/route-state';

export default function WalletLoading() {
  return (
    <RouteLoadingState
      description="Track subscription billing, verification wallet funding, and operational wallet context."
      eyebrow="Finance"
      summaryCount={3}
      tableRows={5}
      title="Wallet"
    />
  );
}
