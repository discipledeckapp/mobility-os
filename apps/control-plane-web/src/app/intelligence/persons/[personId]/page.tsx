import { ControlPlaneShell } from '../../../../features/shared/control-plane-shell';
import {
  getIntelligencePerson,
  getPersonRiskSummary,
  listPersonIdentityChanges,
  listPersonAssociations,
  listPersonLinkageEvents,
  listReviewCases,
  listIdentifiersByPerson,
  listRiskSignalsByPerson,
  listWatchlistEntriesByPerson,
} from '../../../../lib/api-intelligence';
import { listTenants } from '../../../../lib/api-control-plane';
import { PersonDetailPanel } from './person-detail-panel';

export default async function IntelligencePersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const [person, identifiers, riskSignals, riskSummary, watchlistEntries, associations, identityChanges, linkageEvents, tenants] = await Promise.all([
    getIntelligencePerson(personId),
    listIdentifiersByPerson(personId).catch(() => []),
    listRiskSignalsByPerson(personId).catch(() => []),
    getPersonRiskSummary(personId).catch(() => null),
    listWatchlistEntriesByPerson(personId).catch(() => []),
    listPersonAssociations(personId).catch(() => []),
    listPersonIdentityChanges(personId).catch(() => []),
    listPersonLinkageEvents(personId).catch(() => []),
    listTenants().catch(() => []),
  ]);
  const reviewCases = await listReviewCases({ personId }).catch(() => []);
  const tenantNameById = new Map(tenants.map((tenant) => [tenant.id, tenant.name]));

  return (
    <ControlPlaneShell
      description="Inspect the canonical person graph record, linked organisations, linked roles, watchlists, review history, and risk posture."
      eyebrow="Verified persons"
      title={person.globalPersonCode ?? person.fullName ?? person.id}
    >
      <PersonDetailPanel
        associations={associations}
        identityChanges={identityChanges}
        identifiers={identifiers}
        linkageEvents={linkageEvents}
        person={person}
        reviewCases={reviewCases}
        riskSummary={riskSummary}
        riskSignals={riskSignals}
        tenantNameById={tenantNameById}
        watchlistEntries={watchlistEntries}
      />
    </ControlPlaneShell>
  );
}
