import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableViewport,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { connection } from 'next/server';
import { SelectField } from '../../features/shared/select-field';
import { ControlPlaneDataNotice } from '../../features/shared/control-plane-page-patterns';
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listTenants } from '../../lib/api-control-plane';
import { requirePlatformSession } from '../../lib/require-platform-session';

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

function subscriptionTone(status?: string | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'trialing') return 'neutral';
  if (status === 'past_due' || status === 'suspended') return 'warning';
  if (status === 'cancelled' || status === 'terminated') return 'danger';
  return 'neutral';
}

function planPosture(tenant: Awaited<ReturnType<typeof listTenants>>[number]): {
  label: string;
  detail: string;
} {
  if (tenant.planName && tenant.planTier) {
    return {
      label: tenant.planName,
      detail: `${tenant.planTier} · ${tenant.subscriptionStatus ?? 'subscription attached'}`,
    };
  }

  if (tenant.subscriptionStatus === 'trialing') {
    return {
      label: 'Trial subscription',
      detail: 'Trialing without a paid tier assignment yet',
    };
  }

  return {
    label: 'No subscription attached',
    detail: 'Assign a plan from the organisation detail page',
  };
}

type TenantsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  await connection();

  const token = await requirePlatformSession();
  const params = (await searchParams) ?? {};
  const tenants = await listTenants(token).catch(() => []);
  const dataWarning =
    tenants.length === 0
      ? 'The organisation registry could not be loaded from the platform API on this request, so this page is showing an honest empty state instead of crashing.'
      : null;
  const query = params.q?.trim().toLowerCase() ?? '';
  const statusFilter = params.status?.trim().toLowerCase() ?? '';
  const filteredTenants = tenants.filter((tenant) => {
    const matchesQuery =
      !query ||
      tenant.name.toLowerCase().includes(query) ||
      tenant.slug.toLowerCase().includes(query);
    const matchesStatus = !statusFilter || tenant.status.toLowerCase() === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <ControlPlaneShell
      description="Review organisation status, plan posture, and governance state across the platform."
      eyebrow="Organisation governance"
      title="Organisations"
    >
      <div className="space-y-6">
        {dataWarning ? <ControlPlaneDataNotice description={dataWarning} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form className="flex flex-wrap gap-3" method="get">
            <Input
              className="min-w-[16rem]"
              defaultValue={params.q ?? ''}
              name="q"
              placeholder="Search organisation name or slug"
            />
            <SelectField
              className="h-11 rounded-[var(--mobiris-radius-button)] border-[var(--mobiris-border)] px-3.5 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.3)] focus:border-[var(--mobiris-primary-light)] focus:ring-4 focus:ring-[var(--mobiris-primary-tint)]"
              defaultValue={params.status ?? ''}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </SelectField>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>
          <Link href="/tenants/new">
            <Button>Provision organisation</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organisation registry</CardTitle>
            <CardDescription>
              Open an organisation to review lifecycle state, invoices, subscription posture, and feature
              overrides.
            </CardDescription>
            <Text tone="muted">
              {filteredTenants.length} of {tenants.length} organisations shown
            </Text>
          </CardHeader>
          <CardContent>
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Lifecycle</TableHead>
                    <TableHead>Plan / tier</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow className="cursor-pointer" key={tenant.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            className="font-medium text-slate-900 hover:text-[var(--mobiris-primary)]"
                            href={`/tenants/${tenant.id}`}
                          >
                            {tenant.name}
                          </Link>
                          <p className="text-xs text-slate-500">{tenant.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={statusTone(tenant.status)}>{tenant.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const posture = planPosture(tenant);
                          return (
                            <div className="space-y-1">
                              <p className="font-medium text-slate-900">{posture.label}</p>
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                {posture.detail}
                              </p>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Badge tone={subscriptionTone(tenant.subscriptionStatus)}>
                          {tenant.subscriptionStatus ?? 'missing'}
                        </Badge>
                      </TableCell>
                      <TableCell>{tenant.country}</TableCell>
                      <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Link href={`/tenants/${tenant.id}`}>
                          <Button variant="secondary">Open</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {filteredTenants.length === 0 ? (
              <Text className="pt-4">No organisations match the current filters.</Text>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
