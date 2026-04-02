const steps = [
  {
    step: '1',
    title: 'Add your drivers',
    body: 'Enter their name, phone, and required documents. Build your verified driver roster.',
    color: 'bg-brand-600',
  },
  {
    step: '2',
    title: 'Verify who they are',
    body: "Run identity checks and capture guarantor details. Know exactly who you're dealing with.",
    color: 'bg-brand-600',
  },
  {
    step: '3',
    title: 'Assign your vehicles',
    body: 'Link each driver to a vehicle with a formal agreement. Every assignment on record.',
    color: 'bg-brand-600',
  },
  {
    step: '4',
    title: 'Track every payment',
    body: 'Log daily remittance. See who paid today, who owes, and the full history for any driver.',
    color: 'bg-brand-600',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-ink leading-tight tracking-tight">
            Up and running in minutes.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            No long setup. No training required. Just start adding your drivers.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 left-[calc(50%+20px)] w-[calc(100%-40px)] h-px bg-slate-200"
                  aria-hidden="true"
                />
              )}
              <div className="flex flex-col items-center text-center">
                {/* Step number circle */}
                <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-white font-bold text-lg mb-5 shadow-sm relative z-10`}>
                  {s.step}
                </div>
                <h3 className="text-base font-semibold text-ink mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA nudge */}
        <div className="mt-16 text-center">
          <a
            href="https://app.mobiris.ng"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base px-7 py-3.5 rounded-lg transition-colors shadow-sm"
          >
            Start for free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
