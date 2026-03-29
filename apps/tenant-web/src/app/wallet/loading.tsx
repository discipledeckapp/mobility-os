import { RouteLoadingState } from '../../features/shared/route-state';

export default function WalletLoading() {
  return (
    <RouteLoadingState
      description="Track verification wallet funding, available credit, and operational wallet context."
      eyebrow="Wallet"
      summaryCount={3}
      tableRows={5}
      title="Wallet and credit"
    />
  );
}
