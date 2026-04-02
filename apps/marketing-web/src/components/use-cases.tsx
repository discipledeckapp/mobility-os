const cases = [
  {
    category: 'Transport operators',
    headline: 'Keke, taxi, and hire purchase fleets',
    description:
      'You manage dozens of drivers on daily remittance. Mobiris gives you a clear record of every assignment, every payment, and every driver — without the WhatsApp chaos.',
    tags: ['Daily remittance', 'Driver assignments', 'Identity verification'],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    accent: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    category: 'Delivery fleets',
    headline: 'Logistics and last-mile operators',
    description:
      'Keep your delivery assets accountable. Verify every rider or driver, track their daily targets, and know exactly which vehicle is where.',
    tags: ['Asset accountability', 'Driver verification', 'Performance tracking'],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    accent: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    category: 'Asset financing',
    headline: 'Hire purchase and leasing operators',
    description:
      'Structure your repayment tracking from day one. Verified identities, signed agreements, and a full audit trail of what was paid and what is outstanding.',
    tags: ['Repayment tracking', 'Guarantor records', 'Signed agreements'],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    accent: 'bg-violet-50 border-violet-200',
    iconBg: 'bg-violet-100 text-violet-600',
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-4">
            Who it's for
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-ink leading-tight tracking-tight">
            Built for the way you
            <br />
            actually operate.
          </h2>
        </div>

        {/* Use case cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div
              key={c.category}
              className={`border rounded-2xl p-7 flex flex-col gap-5 ${c.accent}`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                {c.icon}
              </div>

              {/* Text */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {c.category}
                </p>
                <h3 className="text-lg font-semibold text-ink mb-2 leading-snug">
                  {c.headline}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-white/70 border border-white/60 text-slate-600 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
