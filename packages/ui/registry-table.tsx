'use client';

import type { ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Text } from './typography';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export interface RegistryTableProps {
  title: string;
  description: string;
  toolbar: ReactNode;
  actions?: ReactNode;
  summary?: ReactNode;
  errorMessage?: string | null | undefined;
  emptyState?: ReactNode;
  totalItems: number;
  filteredItems: number;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  children: ReactNode;
}

export function RegistryTable({
  title,
  description,
  toolbar,
  actions,
  summary,
  errorMessage,
  emptyState,
  totalItems,
  filteredItems,
  page,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  children,
}: RegistryTableProps) {
  const totalPages = Math.max(1, Math.ceil(Math.max(filteredItems, 1) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startItem = filteredItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = filteredItems === 0 ? 0 : Math.min(filteredItems, currentPage * pageSize);

  return (
    <Card>
      <CardHeader className="space-y-4 border-b border-[var(--mobiris-border)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
        </div>
        <div className="rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)] bg-[var(--mobiris-surface-subtle,#f8fafc)] p-4">
          {toolbar}
        </div>
      </CardHeader>
      {summary ? (
        <CardContent className="border-b border-[var(--mobiris-border)]">{summary}</CardContent>
      ) : null}
      <CardContent className="space-y-4">
        {errorMessage ? (
          <div className="space-y-2 rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-rose-200 bg-rose-50 p-4">
            <Text tone="danger">Records are unavailable right now.</Text>
            <Text tone="muted">{errorMessage}</Text>
          </div>
        ) : filteredItems === 0 ? (
          (emptyState ?? <Text tone="muted">No records match the current filters.</Text>)
        ) : (
          <>
            {children}
            <div className="flex flex-col gap-3 border-t border-[var(--mobiris-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Text tone="muted">
                Showing {startItem}-{endItem} of {filteredItems}
                {filteredItems !== totalItems ? ` filtered from ${totalItems}` : ''} records.
              </Text>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--mobiris-ink-soft)]">
                  <span>Rows</span>
                  <select
                    className="h-9 rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-3 text-sm text-[var(--mobiris-ink)] shadow-[0_12px_28px_-20px_rgba(15,23,42,0.35)] focus:outline-none focus:ring-2 focus:ring-[var(--mobiris-primary)]"
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                    value={pageSize}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <span
                    className={cx(
                      'inline-flex h-10 min-w-20 items-center justify-center rounded-[var(--mobiris-radius-button)] border border-[var(--mobiris-border)] bg-white px-3 text-sm font-medium text-[var(--mobiris-ink)]',
                    )}
                  >
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
