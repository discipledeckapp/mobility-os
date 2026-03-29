'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { useActionState } from 'react';

type CsvActionState = {
  error?: string;
  success?: string;
};

export function CsvBulkImportCard({
  id,
  title,
  description,
  formAction,
  templateHref,
  exportHref,
  checkboxName,
  checkboxLabel,
}: {
  id?: string;
  title: string;
  description: string;
  formAction: (state: CsvActionState, formData: FormData) => Promise<CsvActionState>;
  templateHref: string;
  exportHref?: string;
  checkboxName?: string;
  checkboxLabel?: string;
}) {
  const [state, action, isPending] = useActionState(formAction, {});
  const excelTemplateHref = `${templateHref}${templateHref.includes('?') ? '&' : '?'}format=xlsx`;

  return (
    <Card className="border-slate-200 bg-white" {...(id ? { id } : {})}>
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
            Download CSV template
          </a>
          <a
            className="inline-flex h-10 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-4 text-sm font-semibold text-[var(--mobiris-primary-dark)]"
            href={excelTemplateHref}
          >
            Download Excel template
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
              accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              required
              type="file"
            />
            <Text tone="muted">CSV, XLS, and XLSX files are supported.</Text>
          </div>
          {checkboxName && checkboxLabel ? (
            <label className="flex items-center gap-3 text-sm text-[var(--mobiris-ink)]">
              <input name={checkboxName} type="checkbox" />
              <span>{checkboxLabel}</span>
            </label>
          ) : null}
          <Button disabled={isPending} type="submit">
            {isPending ? 'Importing...' : 'Import file'}
          </Button>
          {state.error ? <Text tone="danger">{state.error}</Text> : null}
          {state.success ? <Text tone="success">{state.success}</Text> : null}
        </form>
      </CardContent>
    </Card>
  );
}
