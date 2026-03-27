'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import { useActionState } from 'react';
import type {
  IdentifierRecord,
  IntelligencePersonRecord,
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
  person,
  identifiers,
  riskSignals,
  watchlistEntries,
}: {
  person: IntelligencePersonRecord;
  identifiers: IdentifierRecord[];
  riskSignals: RiskSignalRecord[];
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
        <Card><CardHeader><Text tone="muted">Name</Text><CardTitle>{person.fullName ?? 'Unknown'}</CardTitle></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Risk score</Text><CardTitle>{person.globalRiskScore}</CardTitle></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Verification</Text><CardTitle>{person.verificationStatus ?? 'Not verified'}</CardTitle></CardHeader></Card>
        <Card><CardHeader><Text tone="muted">Watchlist</Text><CardTitle>{person.isWatchlisted ? 'Flagged' : 'Clear'}</CardTitle></CardHeader></Card>
      </div>

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
          <p className="text-sm text-slate-600">{identifier.value}</p>
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
