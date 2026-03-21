import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mobility-os/ui';
import Link from 'next/link';
import { ControlPlaneShell } from './control-plane-shell';

interface FeaturePageProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

export function FeaturePage({ eyebrow, title, description, bullets }: FeaturePageProps) {
  return (
    <ControlPlaneShell description={description} eyebrow={eyebrow} title={title}>
      <div className="space-y-4">
        <Link href="/">
          <Button size="sm" variant="ghost">
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
              <p className="text-sm leading-6 text-slate-600" key={bullet}>
                {bullet}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </ControlPlaneShell>
  );
}
