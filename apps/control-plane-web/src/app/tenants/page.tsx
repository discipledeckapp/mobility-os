import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { ControlPlaneShell } from '../../features/shared/control-plane-shell';
import { listTenants } from '../../lib/api-control-plane';

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'terminated') return 'danger';
  return 'neutral';
}

type TenantsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const params = (await searchParams) ?? {};
  const tenants = await listTenants();
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
      title="Tenants"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form className="flex flex-wrap gap-3" method="get">
            <input
              className="min-w-[16rem] rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue={params.q ?? ''}
              name="q"
              placeholder="Search organisation name or slug"
            />
            <select
              className="rounded-[var(--mobiris-radius-button)] border border-slate-200 bg-white px-3 py-2 text-sm"
              defaultValue={params.status ?? ''}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>
          <Link href="/tenants/new">
            <Button>Provision tenant</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant registry</CardTitle>
            <CardDescription>
              Open a tenant to review lifecycle state, invoices, subscription posture, and feature
              overrides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableViewport>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
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
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {tenant.planName ?? 'Not assigned'}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {tenant.planTier ?? 'No tier'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{tenant.country}</TableCell>
                      <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableViewport>
            {filteredTenants.length === 0 ? (
              <Text className="pt-4">No tenants match the current filters.</Text>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
