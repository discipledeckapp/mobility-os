import { RouteLoadingState } from '../../features/shared/route-state';

export default function WalletLoading() {
  return (
    <RouteLoadingState
      description="Load operational wallet balances and ledger activity for the selected business entity."
      eyebrow="Operational Finance"
      summaryCount={3}
      tableRows={5}
      title="Operational wallet"
    />
  );
}
