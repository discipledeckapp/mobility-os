import { Badge, Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { ControlPlaneShell } from '../../../features/shared/control-plane-shell';
import { listPlans } from '../../../lib/api-control-plane';
import { requirePlatformSession } from '../../../lib/require-platform-session';
import { ProvisionTenantForm } from '../provision-tenant-form';

export default async function NewTenantPage() {
  const token = await requirePlatformSession();
  const plans = await listPlans(token);

  return (
    <ControlPlaneShell
      description="Provision an organisation, create its first operator, assign a plan, and establish the opening platform wallet state."
      eyebrow="Organisation onboarding"
      title="Provision a new organisation"
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <ProvisionTenantForm plans={plans} />
          <Card className="border-slate-200/80 bg-slate-50/70">
            <CardHeader>
              <Badge tone="neutral">Onboarding checklist</Badge>
              <CardTitle>What this flow establishes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Organisation record and platform-facing governance context',
                'Initial operator access for the organisation console',
                'Default plan assignment and opening subscription posture',
                'Opening platform wallet credit without direct database work',
              ].map((item) => (
                <Text key={item}>{item}</Text>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </ControlPlaneShell>
  );
}
