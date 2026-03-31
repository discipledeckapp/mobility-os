import Link from 'next/link';
import { Badge, Text } from '@mobility-os/ui';
import type { OperationalActivityItem } from '../lib/operational-activity';

const activityKindColors: Record<string, string> = {
  driver: 'bg-blue-400',
  vehicle: 'bg-violet-400',
  assignment: 'bg-emerald-400',
  remittance: 'bg-amber-400',
  maintenance: 'bg-orange-400',
  inspection: 'bg-sky-400',
  incident: 'bg-rose-400',
  record: 'bg-slate-400',
};

const badgeToneByStatus = {
  active: 'success',
  available: 'success',
  confirmed: 'success',
  completed: 'success',
  resolved: 'success',
  pending: 'warning',
  suspended: 'warning',
  maintenance: 'warning',
  open: 'warning',
  disputed: 'danger',
  rejected: 'danger',
  overdue: 'danger',
  cancelled: 'danger',
  retired: 'danger',
  waived: 'neutral',
} as const;

export function OperationalActivityList({
  items,
  emptyMessage,
}: {
  items: OperationalActivityItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return <Text tone="muted">{emptyMessage}</Text>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div className="flex items-start gap-3 py-3" key={item.id}>
          <div className="mt-1.5 flex-shrink-0">
            <div className={`h-2 w-2 rounded-full ${activityKindColors[item.kind] ?? 'bg-slate-300'}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-[var(--mobiris-ink)]">{item.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {new Date(item.timestamp).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-2">
            {item.status ? (
              <Badge tone={badgeToneByStatus[item.status as keyof typeof badgeToneByStatus] ?? 'neutral'}>
                {item.status.replaceAll('_', ' ')}
              </Badge>
            ) : null}
            <Link href={item.href}>
              <span className="rounded-full bg-[var(--mobiris-primary-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--mobiris-primary-dark)]">
                Open
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
