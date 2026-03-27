import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from '@mobility-os/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import { PersonLookupForm } from './person-lookup-form';

export default function IntelligencePersonsPage() {
  return (
    <ControlPlaneShell
      description="Look up a canonical person record directly and inspect watchlists, identifiers, and risk posture."
      eyebrow="Intelligence operations"
      title="Person lookup"
    >
      <Card>
        <CardHeader>
          <CardTitle>Open a person record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text tone="muted">
            Enter a canonical person ID in the path to inspect the full intelligence-plane record.
          </Text>
          <PersonLookupForm />
          <Text tone="muted">
            Open directly using a URL such as <code>/intelligence/persons/&lt;personId&gt;</code>.
          </Text>
          <Link href={'/intelligence/review-cases' as Route}>
            <button
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              type="button"
            >
              Open review queue
            </button>
          </Link>
        </CardContent>
      </Card>
    </ControlPlaneShell>
  );
}
