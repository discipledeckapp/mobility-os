import { ControlPlaneShell } from '../../../../features/shared/control-plane-shell';
import {
  getIntelligencePerson,
  listIdentifiersByPerson,
  listRiskSignalsByPerson,
  listWatchlistEntriesByPerson,
} from '../../../../lib/api-intelligence';
import { PersonDetailPanel } from './person-detail-panel';

export default async function IntelligencePersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const [person, identifiers, riskSignals, watchlistEntries] = await Promise.all([
    getIntelligencePerson(personId),
    listIdentifiersByPerson(personId).catch(() => []),
    listRiskSignalsByPerson(personId).catch(() => []),
    listWatchlistEntriesByPerson(personId).catch(() => []),
  ]);

  return (
    <ControlPlaneShell
      description="Inspect the canonical person graph record and operate risk, identifier, and watchlist governance directly from the intelligence plane."
      eyebrow="Intelligence operations"
      title={person.fullName ?? person.id}
    >
      <PersonDetailPanel
        identifiers={identifiers}
        person={person}
        riskSignals={riskSignals}
        watchlistEntries={watchlistEntries}
      />
    </ControlPlaneShell>
  );
}
