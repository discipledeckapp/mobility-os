'use client';

import { useActionState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';

type CsvActionState = {
  error?: string;
  success?: string;
};

export function CsvBulkImportCard({
  title,
  description,
  formAction,
  templateHref,
  exportHref,
  checkboxName,
  checkboxLabel,
}: {
  title: string;
  description: string;
  formAction: (
    state: CsvActionState,
    formData: FormData,
  ) => Promise<CsvActionState>;
  templateHref: string;
  exportHref?: string;
  checkboxName?: string;
  checkboxLabel?: string;
}) {
  const [state, action, isPending] = useActionState(formAction, {});

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Text tone="muted">{description}</Text>
        <div className="flex flex-wrap gap-3">
          <a
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
            href={templateHref}
          >
            Download template
          </a>
          {exportHref ? (
            <a
              className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
              href={exportHref}
            >
              Export current records
            </a>
          ) : null}
        </div>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-[var(--mobiris-ink)]"
              htmlFor={title.replace(/\s+/g, '-').toLowerCase()}
            >
              CSV file
            </label>
            <input
              className="block w-full rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-3 py-2 text-sm text-[var(--mobiris-ink)]"
              id={title.replace(/\s+/g, '-').toLowerCase()}
              name="csvFile"
              accept=".csv,text/csv"
              required
              type="file"
            />
          </div>
          {checkboxName && checkboxLabel ? (
            <label className="flex items-center gap-3 text-sm text-[var(--mobiris-ink)]">
              <input name={checkboxName} type="checkbox" />
              <span>{checkboxLabel}</span>
            </label>
          ) : null}
          <Button disabled={isPending} type="submit">
            {isPending ? 'Importing...' : 'Import CSV'}
          </Button>
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
        </form>
      </CardContent>
    </Card>
  );
}
