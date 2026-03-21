import { Button, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { TenantAppShell } from './tenant-app-shell';

type RouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

type RouteErrorStateProps = RouteShellProps & {
  error: Error;
  reset: () => void;
  heading: string;
};

type RouteLoadingStateProps = RouteShellProps & {
  summaryCount?: number;
  tableRows?: number;
};

export function RouteErrorState({
  eyebrow,
  title,
  description,
  error,
  reset,
  heading,
}: RouteErrorStateProps) {
  return (
    <TenantAppShell description={description} eyebrow={eyebrow} title={title}>
      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Text>{error.message}</Text>
          <Button onClick={reset} variant="secondary">
            Try again
          </Button>
        </CardContent>
      </Card>
    </TenantAppShell>
  );
}

export function RouteLoadingState({
  eyebrow,
  title,
  description,
  summaryCount = 3,
  tableRows = 6,
}: RouteLoadingStateProps) {
  return (
    <TenantAppShell description={description} eyebrow={eyebrow} title={title}>
      <div className="space-y-6">
        <div className={`grid gap-4 ${summaryCount >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {Array.from({ length: summaryCount }).map((_, index) => (
            <div
              className="animate-pulse rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-5"
              key={`summary-${index + 1}`}
            >
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="mt-4 h-8 w-20 rounded bg-slate-300" />
              <div className="mt-3 h-3 w-32 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="animate-pulse rounded-[var(--mobiris-radius-card)] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-full rounded bg-slate-200 md:max-w-sm" />
            <div className="h-10 w-40 rounded bg-slate-200" />
            <div className="h-10 w-32 rounded bg-slate-200" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="h-4 rounded bg-slate-200" key={`header-${index + 1}`} />
              ))}
            </div>
            {Array.from({ length: tableRows }).map((_, rowIndex) => (
              <div className="grid grid-cols-5 gap-3" key={`row-${rowIndex + 1}`}>
                {Array.from({ length: 5 }).map((_, columnIndex) => (
                  <div
                    className="h-10 rounded bg-slate-100"
                    key={`row-${rowIndex + 1}-col-${columnIndex + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TenantAppShell>
  );
}
