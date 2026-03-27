import { Card, CardContent, CardHeader, CardTitle, Text } from '@mobility-os/ui';
import { LEGAL_DOCUMENTS } from '@mobility-os/domain-config';

export default function TermsPage() {
  const document = LEGAL_DOCUMENTS.terms;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <Text className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
            Legal
          </Text>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{document.title}</h1>
          <Text tone="muted">
            Version {document.version}. {document.summary}
          </Text>
        </div>
        <Card className="border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.2)]">
          <CardHeader>
            <CardTitle>Terms of Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {document.sections.map((section) => (
              <section className="space-y-2" key={section.heading}>
                <h2 className="text-base font-semibold text-slate-900">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p className="text-sm leading-7 text-slate-600" key={paragraph}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
