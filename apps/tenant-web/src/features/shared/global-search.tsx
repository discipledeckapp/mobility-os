'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState, useTransition } from 'react';
import { Button, Input, Text } from '@mobility-os/ui';
import { Modal } from './modal';

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: 'driver' | 'vehicle' | 'fleet' | 'assignment';
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    startTransition(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          setResults([]);
          return;
        }
        setResults((await response.json()) as SearchResult[]);
      } catch {
        setResults([]);
      }
    });

    return () => controller.abort();
  }, [open, query]);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        Search
      </Button>
      <Modal
        description="Find drivers, vehicles, fleets, and assignments from one place."
        onClose={() => setOpen(false)}
        open={open}
        size="lg"
        title="Global search"
      >
        <div className="space-y-4">
          <Input
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search drivers, vehicles, fleets, assignments"
            value={query}
          />
          {query.trim().length < 2 ? (
            <Text tone="muted">Enter at least two characters to search.</Text>
          ) : isPending ? (
            <Text tone="muted">Searching…</Text>
          ) : results.length === 0 ? (
            <Text tone="muted">No matching records found.</Text>
          ) : (
            <div className="space-y-2">
              {results.map((result) => (
                <Link
                  className="block rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-[var(--mobiris-primary-light)] hover:bg-white"
                  href={result.href as Route}
                  key={`${result.type}-${result.id}`}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--mobiris-ink)]">{result.title}</p>
                      <p className="text-sm text-slate-500">{result.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                      {result.type}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
