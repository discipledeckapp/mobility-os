'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@mobility-os/ui';
import { useActionState } from 'react';
import type {
  IdentifierRecord,
  IdentityChangeEventRecord,
  IntelligencePersonRecord,
  LinkageEventRecord,
  PersonRiskSummaryRecord,
  PersonAssociationRecord,
  ReviewCaseRecord,
  RiskSignalRecord,
  WatchlistEntryRecord,
} from '../../../../lib/api-intelligence';
import {
  addIdentifierAction,
  addRiskSignalAction,
  createWatchlistEntryAction,
  deactivateRiskSignalAction,
  deactivateWatchlistEntryAction,
  type PersonActionState,
  verifyIdentifierAction,
} from './actions';

const initialState: PersonActionState = {};

export function PersonDetailPanel({
  associations,
  identityChanges,
  person,
  linkageEvents,
  reviewCases,
  riskSummary,
  identifiers,
  riskSignals,
  tenantNameById,
  watchlistEntries,
}: {
  associations: PersonAssociationRecord[];
  identityChanges: IdentityChangeEventRecord[];
  person: IntelligencePersonRecord;
  linkageEvents: LinkageEventRecord[];
  reviewCases: ReviewCaseRecord[];
  riskSummary: PersonRiskSummaryRecord | null;
  identifiers: IdentifierRecord[];
  riskSignals: RiskSignalRecord[];
  tenantNameById: Map<string, string>;
  watchlistEntries: WatchlistEntryRecord[];
}) {
  const [riskState, addRiskAction, riskPending] = useActionState(addRiskSignalAction, initialState);
  const [identifierState, addIdentifierActionState, identifierPending] = useActionState(
    addIdentifierAction,
    initialState,
  );
  const [watchlistState, addWatchlistAction, watchlistPending] = useActionState(
    createWatchlistEntryAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <Card><CardHeader><Text tone="muted">Person</Text><CardTitle>{person.fullName ?? 'Unknown'}</CardTitle><Text tone="muted">{person.globalPersonCode ?? 'Global code pending'}</Text></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Risk</Text><CardTitle>{person.globalRiskScore}</CardTitle><Text tone="muted">{person.riskBand}</Text></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Verification</Text><CardTitle>{person.verificationStatus ?? 'Not verified'}</CardTitle><Text tone="muted">{person.verificationProvider ?? 'No provider yet'}</Text></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Watchlist</Text><CardTitle>{person.isWatchlisted ? 'Flagged' : 'Clear'}</CardTitle><Text tone="muted">{riskSummary?.staleLinkedRecordCount ?? 0} stale linked records</Text></CardHeader></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Canonical identity summary</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Text tone="muted">Live selfie</Text>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {person.selfieImageUrl ? (
                  <img alt={`${person.fullName ?? person.id} live selfie`} className="aspect-[4/3] w-full object-cover" src={person.selfieImageUrl} />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center p-4"><Text tone="muted">No selfie stored</Text></div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Text tone="muted">Government record image</Text>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                {person.providerImageUrl ?? person.photoUrl ? (
                  <img alt={`${person.fullName ?? person.id} provider record`} className="aspect-[4/3] w-full object-cover" src={person.providerImageUrl ?? person.photoUrl ?? ''} />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center p-4"><Text tone="muted">No provider image stored</Text></div>
                )}
              </div>
            </div>
            <div><Text tone="muted">Date of birth</Text><Text>{person.dateOfBirth ?? 'Not recorded'}</Text></div>
            <div><Text tone="muted">Gender</Text><Text>{person.gender ?? 'Not recorded'}</Text></div>
            <div><Text tone="muted">Address</Text><Text>{person.address ?? 'Not recorded'}</Text></div>
            <div><Text tone="muted">Fraud signals</Text><Text>{person.fraudSignalCount}</Text></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Linked organisations and roles</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Local record</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Reverification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {associations.map((association) => (
                  <TableRow key={association.id}>
                    <TableCell>{tenantNameById.get(association.tenantId) ?? association.tenantId}</TableCell>
                    <TableCell>{association.roleType}</TableCell>
                    <TableCell>{association.localEntityType} · {association.localEntityId ?? 'n/a'}</TableCell>
                    <TableCell>{association.verifiedAt ? new Date(association.verifiedAt).toLocaleString() : 'Pending'}</TableCell>
                    <TableCell>
                      {association.reverificationRequired ? (
                        <div className="space-y-1">
                          <Badge tone="warning">Required</Badge>
                          <p className="text-xs text-slate-500">{association.reverificationReason ?? 'Identity snapshot is stale'}</p>
                        </div>
                      ) : (
                        <Badge tone="success">Current</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {associations.length === 0 ? (
                  <TableRow><TableCell className="py-6 text-center text-slate-500" colSpan={5}>No linked local records yet.</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {riskSummary ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Risk explanation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4"><Text tone="muted">Linked organisations</Text><p className="text-2xl font-semibold text-slate-900">{riskSummary.linkedOrganisationCount}</p></div>
                <div className="rounded-2xl border border-slate-200 p-4"><Text tone="muted">Open review items</Text><p className="text-2xl font-semibold text-slate-900">{riskSummary.activeReviewCaseCount}</p></div>
                <div className="rounded-2xl border border-slate-200 p-4"><Text tone="muted">Guarantor exposure</Text><p className="text-2xl font-semibold text-slate-900">{riskSummary.guarantorLinkedDriverCount}</p></div>
              </div>
              <div className="space-y-2">
                {riskSummary.contributingFactors.map((factor) => (
                  <div className="rounded-2xl border border-slate-200 px-4 py-3" key={factor.code}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{factor.label}</p>
                      <Badge tone={factor.weight >= 20 ? 'warning' : 'neutral'}>+{factor.weight}</Badge>
                    </div>
                    {factor.detail ? <p className="mt-1 text-sm text-slate-600">{factor.detail}</p> : null}
                  </div>
                ))}
                {riskSummary.contributingFactors.length === 0 ? <Text tone="muted">No active risk factors are contributing right now.</Text> : null}
              </div>
              {riskSummary.correctiveAction ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-900">Recommended corrective action</p>
                  <p className="mt-1 text-sm text-amber-800">{riskSummary.correctiveAction}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Identity change audit trail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {identityChanges.map((event) => (
                <div className="rounded-2xl border border-slate-200 px-4 py-3" key={event.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{event.changedFields.join(', ') || event.eventType}</p>
                    <Badge tone="warning">Canonical update</Badge>
                  </div>
                  {event.reason ? <p className="mt-1 text-sm text-slate-600">{event.reason}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {identityChanges.length === 0 ? <Text tone="muted">No canonical identity changes have been recorded yet.</Text> : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Identifiers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {identifiers.map((identifier) => {
              return <IdentifierRow identifier={identifier} key={identifier.id} personId={person.id} />;
            })}
            <form action={addIdentifierActionState} className="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4">
              <input name="personId" type="hidden" value={person.id} />
              <Text tone="muted">Add identifier</Text>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" defaultValue="NATIONAL_ID" name="type" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="value" placeholder="Identifier value" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="countryCode" placeholder="Country code when required" />
              {identifierState.error ? <Text className="text-rose-700">{identifierState.error}</Text> : null}
              {identifierState.success ? <Text className="text-emerald-700">{identifierState.success}</Text> : null}
              <Button disabled={identifierPending} type="submit">Add identifier</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk signals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {riskSignals.map((signal) => {
              return <RiskSignalRow key={signal.id} personId={person.id} signal={signal} />;
            })}
            <form action={addRiskAction} className="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4">
              <input name="personId" type="hidden" value={person.id} />
              <Text tone="muted">Add risk signal</Text>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="type" placeholder="Signal type" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" defaultValue="medium" name="severity" placeholder="Severity" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" defaultValue="system" name="source" placeholder="Source" />
              {riskState.error ? <Text className="text-rose-700">{riskState.error}</Text> : null}
              {riskState.success ? <Text className="text-emerald-700">{riskState.success}</Text> : null}
              <Button disabled={riskPending} type="submit">Add risk signal</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Watchlist</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {watchlistEntries.map((entry) => {
              return <WatchlistEntryRow entry={entry} key={entry.id} personId={person.id} />;
            })}
            <form action={addWatchlistAction} className="space-y-3 rounded-2xl border border-dashed border-slate-300 p-4">
              <input name="personId" type="hidden" value={person.id} />
              <Text tone="muted">Create watchlist entry</Text>
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="type" placeholder="fraud_watch" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="reason" placeholder="Reason" />
              <input className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" name="expiresAt" placeholder="Optional expiry ISO timestamp" />
              {watchlistState.error ? <Text className="text-rose-700">{watchlistState.error}</Text> : null}
              {watchlistState.success ? <Text className="text-emerald-700">{watchlistState.success}</Text> : null}
              <Button disabled={watchlistPending} type="submit">Create entry</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Review history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {reviewCases.map((reviewCase) => (
              <div className="rounded-2xl border border-slate-200 px-4 py-3" key={reviewCase.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{reviewCase.id}</p>
                    <p className="text-sm text-slate-600">{reviewCase.status}{reviewCase.resolution ? ` · ${reviewCase.resolution}` : ''}</p>
                  </div>
                  <Badge tone={reviewCase.status === 'resolved' ? 'success' : 'warning'}>{reviewCase.status}</Badge>
                </div>
              </div>
            ))}
            {reviewCases.length === 0 ? <Text tone="muted">No review cases linked to this person.</Text> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Linkage history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {linkageEvents.map((event) => (
              <div className="rounded-2xl border border-slate-200 px-4 py-3" key={event.id}>
                <p className="text-sm font-semibold text-slate-900">{event.eventType}</p>
                <p className="text-sm text-slate-600">{event.reason ?? 'No reason recorded'}</p>
                <p className="text-xs text-slate-500">{new Date(event.occurredAt).toLocaleString()}</p>
              </div>
            ))}
            {linkageEvents.length === 0 ? <Text tone="muted">No linkage events recorded for this person yet.</Text> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IdentifierRow({ personId, identifier }: { personId: string; identifier: IdentifierRecord }) {
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyIdentifierAction,
    initialState,
  );

  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{identifier.type}</p>
          <p className="text-sm text-slate-600">{identifier.maskedValue}</p>
        </div>
        <Badge tone={identifier.isVerified ? 'success' : 'warning'}>
          {identifier.isVerified ? 'Verified' : 'Pending'}
        </Badge>
      </div>
      {!identifier.isVerified ? (
        <form action={verifyAction} className="mt-3">
          <input name="id" type="hidden" value={identifier.id} />
          <input name="personId" type="hidden" value={personId} />
          <Button disabled={verifyPending} type="submit" variant="secondary">
            Verify
          </Button>
          {verifyState.error ? <Text className="mt-2 text-rose-700">{verifyState.error}</Text> : null}
        </form>
      ) : null}
    </div>
  );
}

function RiskSignalRow({ personId, signal }: { personId: string; signal: RiskSignalRecord }) {
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateRiskSignalAction,
    initialState,
  );

  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{signal.type}</p>
          <p className="text-sm text-slate-600">{signal.severity} · {signal.source}</p>
        </div>
        <Badge tone={signal.isActive ? 'warning' : 'neutral'}>
          {signal.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      {signal.isActive ? (
        <form action={deactivateAction} className="mt-3">
          <input name="id" type="hidden" value={signal.id} />
          <input name="personId" type="hidden" value={personId} />
          <Button disabled={deactivatePending} type="submit" variant="secondary">
            Deactivate
          </Button>
          {deactivateState.error ? <Text className="mt-2 text-rose-700">{deactivateState.error}</Text> : null}
        </form>
      ) : null}
    </div>
  );
}

function WatchlistEntryRow({
  personId,
  entry,
}: {
  personId: string;
  entry: WatchlistEntryRecord;
}) {
  const [deactivateState, deactivateAction, deactivatePending] = useActionState(
    deactivateWatchlistEntryAction,
    initialState,
  );

  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
          <p className="text-sm text-slate-600">{entry.reason}</p>
        </div>
        <Badge tone={entry.isActive ? 'danger' : 'neutral'}>
          {entry.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      {entry.isActive ? (
        <form action={deactivateAction} className="mt-3">
          <input name="id" type="hidden" value={entry.id} />
          <input name="personId" type="hidden" value={personId} />
          <Button disabled={deactivatePending} type="submit" variant="secondary">
            Deactivate
          </Button>
          {deactivateState.error ? <Text className="mt-2 text-rose-700">{deactivateState.error}</Text> : null}
        </form>
      ) : null}
    </div>
  );
}
