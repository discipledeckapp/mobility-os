'use client';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Text } from './typography';

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function LoadingBar({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cx(
        'animate-pulse rounded-full bg-[linear-gradient(90deg,rgba(37,99,235,0.10),rgba(15,23,42,0.08),rgba(37,99,235,0.10))] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

const TABLE_COLUMN_KEYS = ['col-1', 'col-2', 'col-3', 'col-4', 'col-5', 'col-6'] as const;
const TABLE_ROW_KEYS = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'] as const;
const METRIC_CARD_KEYS = ['metric-1', 'metric-2', 'metric-3', 'metric-4'] as const;
const DETAIL_SECTION_KEYS = ['section-1', 'section-2', 'section-3'] as const;
const DETAIL_GRID_KEYS = [
  'field-1',
  'field-2',
  'field-3',
  'field-4',
  'field-5',
  'field-6',
] as const;
const SIDEBAR_ITEM_KEYS = ['sidebar-1', 'sidebar-2', 'sidebar-3', 'sidebar-4'] as const;
const SIDEBAR_PANEL_KEYS = ['panel-1', 'panel-2'] as const;
const SIDEBAR_PANEL_ROW_KEYS = [
  'panel-row-1',
  'panel-row-2',
  'panel-row-3',
  'panel-row-4',
  'panel-row-5',
] as const;

export function PageLoadingState({
  title,
  description,
  metricLabels = [],
  showTable = true,
}: {
  title: string;
  description: string;
  metricLabels?: string[];
  showTable?: boolean;
}) {
  const metricGridClass =
    metricLabels.length <= 1
      ? 'md:grid-cols-1'
      : metricLabels.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <CardContent className="space-y-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <LoadingBar className="h-3 w-28" />
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <Text tone="muted">{description}</Text>
              </div>
            </div>
            <LoadingBar className="h-10 w-32 rounded-[var(--mobiris-radius-button)]" />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div className="space-y-2">
              <LoadingBar className="h-3 w-24" />
              <LoadingBar className="h-11 w-full rounded-[var(--mobiris-radius-button)]" />
            </div>
            <div className="space-y-2">
              <LoadingBar className="h-3 w-20" />
              <LoadingBar className="h-11 w-full rounded-[var(--mobiris-radius-button)]" />
            </div>
            <div className="space-y-2">
              <LoadingBar className="h-3 w-20" />
              <LoadingBar className="h-11 w-full rounded-[var(--mobiris-radius-button)]" />
            </div>
            <div className="flex items-end">
              <LoadingBar className="h-10 w-28 rounded-[var(--mobiris-radius-button)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {metricLabels.length > 0 ? (
        <div className={cx('grid gap-4', metricGridClass)}>
          {metricLabels.map((label) => (
            <Card className="border-slate-200 bg-white" key={label}>
              <CardContent className="space-y-3 py-5">
                <Text tone="muted">{label}</Text>
                <LoadingBar className="h-9 w-24" />
                <LoadingBar className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {showTable ? (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Loading records</CardTitle>
            <Text tone="muted">
              Preparing the latest organisation data and shaping the registry view.
            </Text>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-[calc(var(--mobiris-radius-card)-0.35rem)] border border-[var(--mobiris-border)]">
              <div className="grid grid-cols-6 gap-4 border-b border-[var(--mobiris-border)] bg-[var(--mobiris-primary-tint)] px-4 py-4">
                {TABLE_COLUMN_KEYS.map((columnKey) => (
                  <LoadingBar className="h-3 w-20" key={columnKey} />
                ))}
              </div>
              <div className="divide-y divide-[var(--mobiris-border)] bg-white">
                {TABLE_ROW_KEYS.map((rowKey) => (
                  <div className="grid grid-cols-6 gap-4 px-4 py-4" key={rowKey}>
                    {TABLE_COLUMN_KEYS.map((columnKey, cellIndex) => (
                      <LoadingBar
                        className={cx(
                          'h-4',
                          cellIndex === 0 ? 'w-24' : cellIndex === 5 ? 'w-16' : 'w-full',
                        )}
                        key={`${rowKey}-${columnKey}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function DetailPageLoadingState({
  title,
  description,
  sidebarTitle = 'Loading context',
  sidebarDescription = 'Preparing the latest organisation record context and evidence.',
}: {
  title: string;
  description: string;
  sidebarTitle?: string;
  sidebarDescription?: string;
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
        <CardContent className="space-y-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <LoadingBar className="h-3 w-28" />
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <Text tone="muted">{description}</Text>
              </div>
            </div>
            <div className="flex gap-3">
              <LoadingBar className="h-10 w-28 rounded-[var(--mobiris-radius-button)]" />
              <LoadingBar className="h-10 w-36 rounded-[var(--mobiris-radius-button)]" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {METRIC_CARD_KEYS.map((metricKey) => (
              <div className="space-y-2" key={metricKey}>
                <LoadingBar className="h-3 w-20" />
                <LoadingBar className="h-7 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="space-y-6">
          <Card className="border-sky-200 bg-sky-50/60">
            <CardHeader>
              <CardTitle>Loading imagery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LoadingBar className="h-64 w-full rounded-[calc(var(--mobiris-radius-card)-0.35rem)]" />
              <LoadingBar className="h-3 w-5/6" />
            </CardContent>
          </Card>

          {DETAIL_SECTION_KEYS.map((sectionKey, sectionIndex) => (
            <Card
              className={cx(
                sectionIndex === 1
                  ? 'border-amber-200 bg-amber-50/55'
                  : sectionIndex === 2
                    ? 'border-emerald-200 bg-emerald-50/55'
                    : 'border-slate-200 bg-white',
              )}
              key={sectionKey}
            >
              <CardHeader>
                <CardTitle>Loading section</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {DETAIL_GRID_KEYS.map((fieldKey) => (
                  <div className="space-y-2" key={`${sectionKey}-${fieldKey}`}>
                    <LoadingBar className="h-3 w-24" />
                    <LoadingBar className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>{sidebarTitle}</CardTitle>
              <Text tone="muted">{sidebarDescription}</Text>
            </CardHeader>
            <CardContent className="space-y-4">
              {SIDEBAR_ITEM_KEYS.map((itemKey) => (
                <div className="space-y-2" key={itemKey}>
                  <LoadingBar className="h-3 w-24" />
                  <LoadingBar className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {SIDEBAR_PANEL_KEYS.map((panelKey, panelIndex) => (
            <Card
              className={cx(
                panelIndex === 0
                  ? 'border-indigo-200 bg-indigo-50/45'
                  : 'border-slate-200 bg-white',
              )}
              key={panelKey}
            >
              <CardHeader>
                <CardTitle>Loading panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SIDEBAR_PANEL_ROW_KEYS.map((rowKey) => (
                  <LoadingBar className="h-4 w-full" key={`${panelKey}-${rowKey}`} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
