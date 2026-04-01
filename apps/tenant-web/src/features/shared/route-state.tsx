import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ProcessingStateCard,
  SkeletonLoadingBlocks,
  Text,
} from '@mobility-os/ui';
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
  organisationName?: string;
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
  organisationName = 'your organisation',
}: RouteLoadingStateProps) {
  return (
    <TenantAppShell description={description} eyebrow={eyebrow} title={title}>
      <div className="space-y-6">
        <ProcessingStateCard
          activeStep={1}
          message="Loading the latest records, summarising operational signals, and preparing the controls for this workspace."
          progressLabel="Preparing your workspace"
          steps={[
            `Connecting to ${organisationName} data`,
            'Refreshing operational summaries',
            'Preparing actionable views',
          ]}
          tips={[
            'Assignment acceptance works best when driver readiness, vehicle availability, and verification status stay aligned.',
            'Remittance exceptions are easier to resolve when due dates and recorded payments match the actual contract schedule.',
            'Role-aware workspaces help operators, finance teams, and drivers act on the same operational truth.',
          ]}
          title="Preparing your dashboard"
          variant="reporting"
        />

        <SkeletonLoadingBlocks
          columns={summaryCount >= 3 ? 3 : 2}
          description="Loading summaries, filters, and the current record table."
          rows={tableRows}
          title="Loading route content"
        />
      </div>
    </TenantAppShell>
  );
}
