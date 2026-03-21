import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Text,
} from '@mobility-os/ui';
import Link from 'next/link';
import { ControlPlaneShell } from '../shared/control-plane-shell';
import type {
  ControlPlaneFeatureCard,
  ControlPlaneSummaryItem,
} from './control-plane-dashboard-data';

interface ControlPlaneDashboardProps {
  summary: ControlPlaneSummaryItem[];
  featureCards: ControlPlaneFeatureCard[];
}

export function ControlPlaneDashboard({ summary, featureCards }: ControlPlaneDashboardProps) {
  return (
    <ControlPlaneShell
      description="Run platform governance, organisation onboarding, subscription oversight, and wallet control from one internal console."
      eyebrow="Platform operations"
      title="Operate the Mobility OS control plane with clear governance boundaries."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,1fr)]">
        <Card className="border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
          <CardHeader>
            <Text tone="muted">Control plane overview</Text>
            <CardTitle>Governance posture</CardTitle>
            <CardDescription>
              Review platform readiness across onboarding, subscriptions, rollout controls, and
              wallet governance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {summary.map((item) => (
                <Card className="border-slate-200/70 shadow-none" key={item.label}>
                  <CardContent className="space-y-3">
                    <Badge tone={item.tone}>{item.label}</Badge>
                    <div className="space-y-1">
                      <Heading size="h3">{item.value}</Heading>
                      <Text tone="muted">{item.detail}</Text>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-950 text-white">
          <CardHeader>
            <Text className="text-blue-100/55">Priority actions</Text>
            <CardTitle className="text-white">Start from organisation onboarding</CardTitle>
            <CardDescription>
              Provision the next organisation, review plan posture, and keep platform controls
              deliberate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Text className="text-sm leading-6 text-blue-50/72">
              This console should stay focused on platform governance. Operators should not need
              direct database access or tenant-side workarounds to complete the core control-plane
              flow.
            </Text>
            <Link href="/tenants">
              <Button variant="secondary">Open organisation onboarding</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80">
        <CardHeader>
          <Text tone="muted">Governance surfaces</Text>
          <CardTitle>Open the platform areas that already belong in the control plane.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {featureCards.map((card) => (
              <Card className="border-slate-200/70 shadow-none" key={card.href}>
                <CardContent className="space-y-4">
                  <Badge
                    tone={
                      card.status === 'Operational'
                        ? 'success'
                        : card.status === 'Needs review'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {card.status}
                  </Badge>
                  <div className="space-y-2">
                    <Heading size="h3">{card.title}</Heading>
                    <Text tone="muted">{card.description}</Text>
                  </div>
                  <Link href={card.href}>
                    <Button variant="ghost">Open surface</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </ControlPlaneShell>
  );
}
