'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'verification', label: 'Verification' },
  { key: 'guarantor', label: 'Guarantor & Risk' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function isTabKey(value: string | null | undefined): value is TabKey {
  return TABS.some((t) => t.key === value);
}

export function DriverDetailTabs({
  overview,
  verification,
  guarantor,
  documents,
  activity,
  defaultTab = 'overview',
}: {
  overview: React.ReactNode;
  verification: React.ReactNode;
  guarantor: React.ReactNode;
  documents: React.ReactNode;
  activity: React.ReactNode;
  defaultTab?: TabKey;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') ?? null;
  const urlTab = isTabKey(tabParam) ? tabParam : null;

  const [manualTab, setManualTab] = useState<TabKey | null>(null);
  const activeTab = manualTab ?? urlTab ?? defaultTab;

  const panels: Record<TabKey, React.ReactNode> = {
    overview,
    verification,
    guarantor,
    documents,
    activity,
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-slate-50/80 p-1">
        {TABS.map((tab) => (
          <button
            className={`flex-shrink-0 rounded-[calc(var(--mobiris-radius-card)-0.2rem)] px-4 py-2 text-sm font-semibold tracking-[-0.01em] transition-all duration-150 ${
              activeTab === tab.key
                ? 'bg-white text-[var(--mobiris-ink)] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.12)]'
                : 'text-slate-500 hover:bg-white/60 hover:text-[var(--mobiris-ink)]'
            }`}
            key={tab.key}
            onClick={() => setManualTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div className="space-y-6">{panels[activeTab]}</div>
    </div>
  );
}
