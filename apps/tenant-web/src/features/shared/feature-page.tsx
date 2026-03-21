import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mobility-os/ui';
import Link from 'next/link';
import { TenantAppShell } from './tenant-app-shell';

interface FeaturePageProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

export function FeaturePage({ eyebrow, title, description, bullets }: FeaturePageProps) {
  return (
    <TenantAppShell description={description} eyebrow={eyebrow} title={title}>
      <div className="space-y-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            ← Back to dashboard
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {bullets.map((bullet) => (
              <p key={bullet} className="text-sm text-slate-600 leading-5">
                {bullet}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </TenantAppShell>
  );
}
